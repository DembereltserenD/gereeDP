import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface UserProfile {
  id: string
  full_name: string | null
  email: string | null
}

interface ServiceContract {
  id: string
  client_name: string
  close_date: string | null
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, full_name, email')

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    let notificationsCreated = 0

    for (const user of (users as UserProfile[]) || []) {
      // Check for contracts expiring in 7 days
      const today = new Date()
      const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

      const { data: contracts, error: contractsError } = await supabase
        .from('service_contracts')
        .select('id, client_name, close_date')
        .gte('close_date', today.toISOString().split('T')[0])
        .lte('close_date', sevenDaysLater.toISOString().split('T')[0])

      if (contractsError) {
        console.error(`Error fetching contracts:`, contractsError)
        continue
      }

      for (const contract of (contracts as ServiceContract[]) || []) {
        // Check if notification already exists for this contract
        const { data: existingNotification } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', user.id)
          .eq('related_type', 'service_contract')
          .eq('related_id', contract.id)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

        if (!existingNotification || existingNotification.length === 0) {
          try {
            const daysUntilExpiry = Math.ceil(
              (new Date(contract.close_date!).getTime() - today.getTime()) / (24 * 60 * 60 * 1000)
            )

            await supabase.from('notifications').insert({
              user_id: user.id,
              title: 'Гэрээ дуусах дөхөж байна',
              message: `${contract.client_name} - ${daysUntilExpiry} хоногийн дараа дуусна`,
              type: 'reminder',
              related_type: 'service_contract',
              related_id: contract.id,
              link: `/service-contracts/${contract.id}`,
            } as never)
            notificationsCreated++
          } catch (error) {
            console.error('Error creating contract expiry notification:', error)
          }
        }
      }

      // Check for sales funnel items that need follow-up
      const { data: salesItems, error: salesError } = await supabase
        .from('sales_funnel')
        .select('id, client_name, close_date, stage')
        .in('stage', ['Hot', 'Warm'])
        .gte('close_date', today.toISOString().split('T')[0])
        .lte('close_date', sevenDaysLater.toISOString().split('T')[0])

      if (salesError) {
        console.error(`Error fetching sales items:`, salesError)
        continue
      }

      interface SalesItem {
        id: string
        client_name: string
        close_date: string | null
        stage: string
      }

      for (const item of (salesItems as SalesItem[]) || []) {
        const { data: existingNotification } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', user.id)
          .eq('related_type', 'sales_funnel')
          .eq('related_id', item.id)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

        if (!existingNotification || existingNotification.length === 0) {
          try {
            await supabase.from('notifications').insert({
              user_id: user.id,
              title: 'Борлуулалт хаах хугацаа дөхөж байна',
              message: `${item.client_name} - хаах хугацаа ойрхон байна`,
              type: 'reminder',
              related_type: 'sales_funnel',
              related_id: item.id,
              link: `/sales-funnel/${item.id}`,
            } as never)
            notificationsCreated++
          } catch (error) {
            console.error('Error creating sales reminder notification:', error)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      notificationsCreated,
      message: `Created ${notificationsCreated} notifications`
    })

  } catch (error) {
    console.error('Error in notification check:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}