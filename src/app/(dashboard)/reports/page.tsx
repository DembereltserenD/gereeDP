import {
  getDashboardMetrics,
  getTeamTargets,
  getFunnelConversions,
  getTopClients,
  type DashboardMetrics,
  type TeamTarget,
} from '@/lib/actions/dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('mn-MN', {
    maximumFractionDigits: 0,
  }).format(value) + '₮'
}

const emptyMetrics: DashboardMetrics = {
  totalOpportunities: 0,
  totalValue: 0,
  closedValue: 0,
  wonValue: 0,
  hotValue: 0,
  lostValue: 0,
  byStage: [],
  byTeam: [],
}

export default async function ReportsPage() {
  let metrics = emptyMetrics
  let teamTargets: TeamTarget[] = []
  let funnelData: { stage: string; count: number; value: number; percentage: number }[] = []
  let topClients: { name: string; value: number }[] = []

  try {
    const results = await Promise.all([
      getDashboardMetrics().catch(() => emptyMetrics),
      getTeamTargets().catch(() => []),
      getFunnelConversions().catch(() => []),
      getTopClients(15).catch(() => []),
    ])
    metrics = results[0]
    teamTargets = results[1]
    funnelData = results[2]
    topClients = results[3]
  } catch (error) {
    console.error('Error loading reports data:', error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Тайлан</h1>
        <p className="text-muted-foreground">
          Дэлгэрэнгүй тайлан мэдээлэл
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-right">Target</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead className="text-right">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamTargets.map((team, index) => (
                  <TableRow key={team.team || index}>
                    <TableCell className="font-medium">{team.team}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(team.target)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(team.actual)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={team.percentage >= 100 ? 'default' : 'secondary'}
                        className={
                          team.percentage >= 100
                            ? 'bg-green-500'
                            : team.percentage >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }
                      >
                        {team.percentage}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stage Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stage</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {funnelData.map((stage) => (
                  <TableRow key={stage.stage}>
                    <TableCell className="font-medium">{stage.stage}</TableCell>
                    <TableCell className="text-right">{stage.count}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(stage.value)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{stage.percentage}%</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Clients by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topClients.map((client, index) => (
                <TableRow key={client.name}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{client.name}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(client.value)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">
                      {metrics.totalValue > 0 ? ((client.value / metrics.totalValue) * 100).toFixed(1) : '0'}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Summary Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Opportunities</span>
              <span className="font-bold">{metrics.totalOpportunities}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Pipeline Value</span>
              <span className="font-bold">{formatCurrency(metrics.totalValue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Closed Value</span>
              <span className="font-bold text-green-600">
                {formatCurrency(metrics.closedValue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Won Value</span>
              <span className="font-bold text-blue-600">
                {formatCurrency(metrics.wonValue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hot Value</span>
              <span className="font-bold text-red-600">
                {formatCurrency(metrics.hotValue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lost Value</span>
              <span className="font-bold text-gray-600">
                {formatCurrency(metrics.lostValue)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Rates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {funnelData.slice(0, -1).map((stage, index) => {
              const nextStage = funnelData[index + 1]
              const conversionRate =
                stage.count > 0
                  ? ((nextStage?.count || 0) / stage.count * 100).toFixed(1)
                  : '0'
              return (
                <div key={stage.stage} className="flex justify-between">
                  <span className="text-muted-foreground">
                    {stage.stage} → {nextStage?.stage || '-'}
                  </span>
                  <span className="font-bold">{conversionRate}%</span>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics.byTeam.map((team) => (
              <div key={team.team} className="flex justify-between">
                <span className="text-muted-foreground">{team.team}</span>
                <div className="text-right">
                  <span className="font-bold">{team.count}</span>
                  <span className="text-muted-foreground text-sm ml-2">
                    ({formatCurrency(team.value)})
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
