-- ╔══════════════════════════════════════════════════════════╗
-- ║   PB STORE - FUNCTIONS & TRIGGERS                        ║
-- ║   Otomatik işlemler: profil oluşturma, stok takibi, vs.  ║
-- ╚══════════════════════════════════════════════════════════╝

-- ════════════════════════════════════════════════════════════
-- 1. Yeni kullanıcı kayıt olduğunda otomatik profil oluştur
-- ════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'customer'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ════════════════════════════════════════════════════════════
-- 2. updated_at otomatik güncelleme
-- ════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Her tabloya updated_at trigger'ı
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_addresses
  BEFORE UPDATE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_categories
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_products
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_orders
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_reviews
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ════════════════════════════════════════════════════════════
-- 3. Sipariş numarası otomatik üret
-- ════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'PB-' || EXTRACT(YEAR FROM NOW()) || '-' ||
      LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();

-- ════════════════════════════════════════════════════════════
-- 4. Adres default yönetimi (bir kullanıcının tek default adresi)
-- ════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.ensure_single_default_address()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.is_default THEN
    UPDATE public.addresses
    SET is_default = false
    WHERE user_id = NEW.user_id
    AND id != NEW.id
    AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER ensure_single_default_address
  AFTER INSERT OR UPDATE ON public.addresses
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION public.ensure_single_default_address();

-- ════════════════════════════════════════════════════════════
-- 5. Sipariş oluşturulunca stok azalt
-- ════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.decrease_stock_on_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.products
  SET
    stock = stock - NEW.quantity,
    sold_count = sold_count + NEW.quantity
  WHERE id = NEW.product_id
  AND stock >= NEW.quantity;

  -- Stok yetersizse hata fırlat
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stok yetersiz veya ürün bulunamadı: %', NEW.product_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER decrease_stock_on_order_item
  AFTER INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.decrease_stock_on_order();

-- ════════════════════════════════════════════════════════════
-- 6. Sipariş tamamlandığında profil istatistiklerini güncelle
-- ════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.update_user_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Sadece status 'paid' veya 'delivered' olduğunda
  IF NEW.status IN ('paid', 'delivered') AND
     (OLD.status IS NULL OR OLD.status NOT IN ('paid', 'delivered')) THEN

    UPDATE public.profiles
    SET
      total_orders = total_orders + 1,
      total_spent = total_spent + NEW.total,
      loyalty_points = loyalty_points + FLOOR(NEW.total / 10),  -- Her 10 TL'ye 1 puan
      loyalty_tier = CASE
        WHEN total_spent + NEW.total >= 50000 THEN 'platinum'
        WHEN total_spent + NEW.total >= 20000 THEN 'gold'
        WHEN total_spent + NEW.total >= 5000 THEN 'silver'
        ELSE 'bronze'
      END
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER update_user_stats_on_order
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_user_stats();

-- ════════════════════════════════════════════════════════════
-- 7. Ürün rating otomatik hesapla
-- ════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.products
  SET
    rating = COALESCE((
      SELECT ROUND(AVG(rating)::NUMERIC, 1)
      FROM public.reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
      AND is_approved = true
    ), 0),
    review_count = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
      AND is_approved = true
    )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_product_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();

-- ════════════════════════════════════════════════════════════
-- 8. Audit log - admin işlemlerini kaydet
-- ════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.audit_log_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data, new_data)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Products için audit
CREATE TRIGGER audit_products
  AFTER INSERT OR UPDATE OR DELETE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();

-- Orders için audit
CREATE TRIGGER audit_orders
  AFTER UPDATE OR DELETE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();

-- Categories için audit
CREATE TRIGGER audit_categories
  AFTER INSERT OR UPDATE OR DELETE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();

-- ════════════════════════════════════════════════════════════
-- BAŞARILI!
-- ════════════════════════════════════════════════════════════
SELECT 'Functions ve Triggers kuruldu! Sonraki: 04_seed_data.sql' AS sonuc;
