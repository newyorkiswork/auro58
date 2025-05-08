import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET() {
  // Fetch all laundromats
  const { data: laundromats, error: laundromatsError } = await supabase.from('laundromats').select('*');
  if (laundromatsError) return NextResponse.json({ error: laundromatsError.message }, { status: 500 });

  // Fetch all machines
  const { data: machines, error: machinesError } = await supabase.from('machines').select('id, laundromat_id, type, status');
  if (machinesError) return NextResponse.json({ error: machinesError.message }, { status: 500 });

  // Compute machine availability per laundromat
  const laundromatsWithAvailability = laundromats.map(laundromat => {
    const laundromatMachines = machines.filter((m: any) => m.laundromat_id === laundromat.id);
    const availability = {
      washer: { available: 0, in_use: 0, out_of_order: 0 },
      dryer: { available: 0, in_use: 0, out_of_order: 0 },
    };
    laundromatMachines.forEach((machine: any) => {
      if (machine.type === 'washer' || machine.type === 'dryer') {
        const type = machine.type as 'washer' | 'dryer';
        if (machine.status === 'available') availability[type].available++;
        else if (machine.status === 'in_use') availability[type].in_use++;
        else if (machine.status === 'out_of_order') availability[type].out_of_order++;
      }
    });
    return { ...laundromat, availability };
  });

  return NextResponse.json({ laundromats: laundromatsWithAvailability });
} 