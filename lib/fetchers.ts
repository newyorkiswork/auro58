// lib/fetchers.ts
import { supabase } from '@/lib/supabaseClient'; // ✅ this is correct

export type Laundromat = {
  id: string;
  name: string;
  borough: string;
  address: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
};

export type Machine = {
  id: string;
  label: string;
  type: 'washer' | 'dryer';
  status: 'available' | 'in_use' | 'out_of_service';
  laundromat_id: string;
};

// ✅ Main laundromats fetch function
export async function getLaundromats(): Promise<any[]> {
  try {
    const res = await fetch('/api/laundromats');
    if (!res.ok) throw new Error('Failed to fetch laundromats');
    const { laundromats } = await res.json();
    return laundromats;
  } catch (error: any) {
    console.error('[getLaundromats] Unexpected Error', error);
    throw new Error(error.message || 'Unexpected error occurred');
  }
}

// ✅ Fetch all machines
export async function getMachines(): Promise<Machine[]> {
  const { data, error } = await supabase.from('machines').select('*');
  if (error) throw error;
  return data as Machine[];
}

// ✅ Fetch machines by laundromat ID
export async function getMachinesByLaundromat(laundromatId: string): Promise<any[]> {
  try {
    const res = await fetch(`/api/laundromats/${laundromatId}`);
    if (!res.ok) throw new Error('Failed to fetch laundromat');
    const { machines } = await res.json();
    return machines;
  } catch (error: any) {
    console.error('[getMachinesByLaundromat] Unexpected Error', error);
    throw new Error(error.message || 'Unexpected error occurred fetching machines');
  }
}

// ✅ Fetch orders with product/item relations
export async function getOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(*))');
  if (error) throw error;
  return data;
}