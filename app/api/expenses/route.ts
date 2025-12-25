import { NextRequest, NextResponse } from 'next/server';
import { getExpenses } from '@/lib/queries/expenses';

export async function GET(request: NextRequest) {
  try {
    const items = await getExpenses();
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}
