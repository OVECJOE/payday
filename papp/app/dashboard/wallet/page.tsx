import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

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
      api.wallet.get(),
      api.wallet.balance(),
    ])
    return { wallet: wallet as Wallet, balance: balance as Balance }
  } catch {
    return { wallet: null, balance: null }
  }
}

export default async function WalletPage() {
  const { wallet, balance } = await getWalletData()

  if (!balance || !wallet) {
    return (
      <div className="p-8">
        <div className="border-2 border-dashed rounded-lg p-12 text-center">
          <p className="text-muted-foreground">Unable to load wallet data</p>
        </div>
      </div>
    )
  }

  const utilizationRate = balance.total > 0 
    ? ((balance.locked / balance.total) * 100).toFixed(1)
    : '0'

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
        <p className="text-muted-foreground">
          Manage your payment balance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded-lg p-8 space-y-4">
          <div className="text-sm text-muted-foreground">Total Balance</div>
          <div className="text-4xl font-bold">
            {formatCurrency(balance.total)}
          </div>
          <div className="text-sm text-muted-foreground">
            Your complete wallet balance
          </div>
        </div>

        <div className="border rounded-lg p-8 space-y-4 bg-green-50 border-green-200">
          <div className="text-sm text-green-800">Available Balance</div>
          <div className="text-4xl font-bold text-green-900">
            {formatCurrency(balance.available)}
          </div>
          <div className="text-sm text-green-700">
            Ready for new payments
          </div>
        </div>

        <div className="border rounded-lg p-8 space-y-4 bg-orange-50 border-orange-200">
          <div className="text-sm text-orange-800">Locked Balance</div>
          <div className="text-4xl font-bold text-orange-900">
            {formatCurrency(balance.locked)}
          </div>
          <div className="text-sm text-orange-700">
            Reserved for pending payments
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-8 space-y-6">
        <h2 className="text-xl font-semibold">Balance utilization</h2>
        
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

      <div className="border rounded-lg p-8 space-y-4">
        <h2 className="text-xl font-semibold">Fund your wallet</h2>
        <p className="text-muted-foreground">
          To add money to your wallet, transfer funds to your Payday account using any of these methods:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div className="border rounded-lg p-4 space-y-2">
            <div className="font-medium">Bank transfer</div>
            <div className="text-sm text-muted-foreground">
              Transfer to your dedicated Payday account number
            </div>
            <div className="text-sm font-mono bg-muted px-3 py-2 rounded mt-2">
              Coming soon
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-2">
            <div className="font-medium">Card payment</div>
            <div className="text-sm text-muted-foreground">
              Fund instantly with your debit or credit card
            </div>
            <div className="text-sm font-mono bg-muted px-3 py-2 rounded mt-2">
              Coming soon
            </div>
          </div>
        </div>
      </div>

      <div className="border-l-4 border-blue-500 bg-blue-50 p-6 rounded">
        <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• When you create a schedule, funds are locked from your available balance</li>
          <li>• Locked funds ensure your scheduled payments will go through</li>
          <li>• After successful payment, locked funds are deducted from your total balance</li>
          <li>• If a payment fails, the locked funds are released back to your available balance</li>
        </ul>
      </div>
    </div>
  )
}
