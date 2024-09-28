import { ProductWithPrice } from '@/types';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const getActiveProductsWithPrices = async (): Promise<ProductWithPrice[]> => {
  const supabase = createServerComponentClient({
    cookies: cookies,
  });

  const { data, error } = await supabase
    .from('products')
    .select('*, prices(*)')  // Remove filters for debugging

  if (error) {
    console.error("Supabase error:", error.message);
    return [];
  }

  console.log("Supabase data:", data);

  return (data as ProductWithPrice[]) || [];
};
