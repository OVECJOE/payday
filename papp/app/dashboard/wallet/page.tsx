import { apiServer } from '@/lib/api-server'
import { formatCurrency } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface Wallet {
  total: number
  available: number
  locked: number
}

interface Balance {
  total: number
  available: number
  locked: number
}

async function getWalletData() {
  try {
    const [wallet, balance] = await Promise.all([
      apiServer.wallet.get(),
      apiServer.wallet.balance(),
    ])
    console.log(wallet, balance)
    return { wallet: wallet as Wallet, balance: balance as Balance }
  } catch {
    return { wallet: null, balance: null }
  }
}

export default async function WalletPage() {
  const { wallet, balance } = await getWalletData()
  if (!balance || !wallet) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="border-2 border-dashed rounded-lg p-6 sm:p-8 lg:p-12 text-center">
          <h4 className="text-lg sm:text-xl font-semibold">Unable to load wallet data</h4>
          <p className="text-sm sm:text-base text-muted-foreground">
            Please refresh the page or contact support if the issue persists.
          </p>
        </div>
      </div>
    )
  }

  const utilizationRate = balance.total > 0 
    ? ((balance.locked / balance.total) * 100).toFixed(1)
    : '0'

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Wallet</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Manage your payment balance
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="border rounded-lg p-4 sm:p-6 lg:p-8 space-y-3 sm:space-y-4">
          <div className="text-xs sm:text-sm text-muted-foreground">Total Balance</div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            {formatCurrency(balance.total)}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">
            Your complete wallet balance
          </div>
        </div>

        <div className="border rounded-lg p-4 sm:p-6 lg:p-8 space-y-3 sm:space-y-4 bg-green-50 border-green-200">
          <div className="text-xs sm:text-sm text-green-800">Available Balance</div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-900">
            {formatCurrency(balance.available)}
          </div>
          <div className="text-xs sm:text-sm text-green-700">
            Ready for new payments
          </div>
        </div>

        <div className="border rounded-lg p-4 sm:p-6 lg:p-8 space-y-3 sm:space-y-4 bg-orange-50 border-orange-200">
          <div className="text-xs sm:text-sm text-orange-800">Locked Balance</div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-900">
            {formatCurrency(balance.locked)}
          </div>
          <div className="text-xs sm:text-sm text-orange-700">
            Reserved for pending payments
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        <h2 className="text-lg sm:text-xl font-semibold">Balance utilization</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Locked funds</span>
            <span className="font-medium">{utilizationRate}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div
              className="bg-primary h-full transition-all"
              style={{ width: `${utilizationRate}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {parseFloat(utilizationRate) > 80
              ? 'Most of your balance is locked for pending payments. Consider adding more funds.'
              : parseFloat(utilizationRate) > 50
              ? 'A significant portion of your balance is locked for pending payments.'
              : 'You have sufficient available balance for new payments.'}
          </p>
        </div>
      </div>

      <div className="border-l-4 border-blue-500 bg-blue-50 p-4 sm:p-6 rounded">
        <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">How it works</h3>
        <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-blue-800">
          <li>When you create a schedule, funds are locked from your available balance</li>
          <li>Locked funds ensure your scheduled payments will go through</li>
          <li>After successful payment, locked funds are deducted from your total balance</li>
          <li>If a payment fails, the locked funds are released back to your available balance</li>
        </ul>
      </div>
    </div>
  )
}
