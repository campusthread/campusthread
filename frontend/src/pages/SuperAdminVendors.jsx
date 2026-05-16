import { useMemo, useState } from 'react'
import { ArrowLeft, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useNotification } from '../hooks/useNotification'
import NotificationToast from '../components/NotificationToast'
import { useGetAllVendorsQuery, useApproveVendorMutation, useRejectVendorMutation } from '../redux/slices/adminApiSlice'

const formatCurrency = (value) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(value || 0))
const cx = (...classes) => classes.filter(Boolean).join(' ')

export default function SuperAdminVendors() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [search, setSearch] = useState('')
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [showRejectFlow, setShowRejectFlow] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const { notifications, showNotification } = useNotification()
  const { data, isLoading, isError } = useGetAllVendorsQuery({ search, page: 1, limit: 100 })
  const vendors = data?.vendors || []
  const totalVendors = vendors.length
  const [approveVendor] = useApproveVendorMutation()
  const [rejectVendor] = useRejectVendorMutation()

  const filteredVendors = useMemo(() => {
    if (!search) return vendors
    return vendors.filter((vendor) => {
      const query = search.toLowerCase()
      return [vendor.brandName, vendor.name, vendor.email, vendor.accountHolderName, vendor.bankName, vendor.accountNumber, vendor.vendorStatus, vendor.phone]
        .filter(Boolean)
        .some((value) => value.toString().toLowerCase().includes(query))
    })
  }, [search, vendors])

  const closeVendorModal = () => {
    setSelectedVendor(null)
    setRejectReason('')
    setShowRejectFlow(false)
    setActionLoading(false)
  }

  const handleApproveVendor = async (vendorId) => {
    setActionLoading(true)
    try {
      await approveVendor(vendorId).unwrap()
      showNotification('Vendor approved successfully!', 'success')
      closeVendorModal()
    } catch (err) {
      showNotification(err?.data?.message || 'Failed to approve vendor', 'error')
      setActionLoading(false)
    }
  }

  const handleRejectVendor = async () => {
    if (!rejectReason.trim()) {
      showNotification('Please provide a rejection reason', 'warning')
      return
    }
    setActionLoading(true)
    try {
      await rejectVendor({ vendorId: selectedVendor._id || selectedVendor.id, reason: rejectReason }).unwrap()
      showNotification('Vendor rejected successfully!', 'success')
      closeVendorModal()
    } catch (err) {
      showNotification(err?.data?.message || 'Failed to reject vendor', 'error')
      setActionLoading(false)
    }
  }

  return (
    <div className={cx('min-h-screen', isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-950')}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate('/super-admin')}
          className={cx(
            'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold shadow-sm transition',
            isDark ? 'border-slate-700 bg-slate-900 text-slate-100 hover:border-slate-500' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400',
          )}
        >
          <ArrowLeft size={16} /> Back to dashboard
        </button>

        <div className={cx('mt-6 rounded-3xl border p-6 shadow-sm', isDark ? 'border-white/10 bg-slate-900' : 'border-slate-200 bg-white')}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight">Vendor Profiles</h1>
              <p className={cx('mt-2 max-w-2xl text-sm', isDark ? 'text-slate-300' : 'text-slate-600')}>
                All registered vendors and their profile details. Search by vendor name, email, bank, or status.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className={cx('relative overflow-hidden rounded-full border px-4 py-2', isDark ? 'border-slate-700 bg-slate-950' : 'border-slate-200 bg-slate-100')}>
                <Search size={16} className={cx('absolute left-4 top-1/2 -translate-y-1/2', isDark ? 'text-slate-400' : 'text-slate-500')} />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search vendors..."
                  className={cx(
                    'w-full rounded-full border-none bg-transparent py-1 pl-10 pr-4 text-sm outline-none',
                    isDark ? 'text-slate-100 placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-500',
                  )}
                />
              </div>
              <div className={cx('rounded-3xl px-4 py-2 text-sm font-semibold', isDark ? 'bg-slate-800 text-slate-100' : 'bg-slate-100 text-slate-900')}>
                Total profiles: {totalVendors}
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200 bg-transparent text-sm shadow-sm dark:border-slate-800">
            <table className="min-w-full table-auto text-left">
              <thead className={cx('border-b', isDark ? 'border-slate-700 bg-slate-950' : 'border-slate-200 bg-slate-50')}>
                <tr>
                  {['Brand Name', 'Brand Owner', 'Email', 'Phone', 'Status', 'Bank', 'Account Number', 'Created'].map((heading) => (
                    <th key={heading} className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={cx('divide-y', isDark ? 'divide-slate-800' : 'divide-slate-200')}>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                      Loading vendor profiles...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-red-600 dark:text-red-400">
                      Failed to load vendor profiles.
                    </td>
                  </tr>
                ) : filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                      No vendors found.
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map((vendor) => (
                    <tr
                      key={vendor._id || vendor.id}
                      onClick={() => {
                        if (vendor.vendorStatus === 'pending') setSelectedVendor(vendor)
                      }}
                      className={cx(
                        isDark ? 'bg-slate-900' : 'bg-white',
                        vendor.vendorStatus === 'pending' ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800' : '',
                      )}
                    >
                      <td className="px-4 py-4 font-semibold text-slate-900 dark:text-slate-100">{vendor.brandName || vendor.name || 'Unknown'}</td>
                      <td className={cx('px-4 py-4', isDark ? 'text-slate-300' : 'text-slate-600')}>{vendor.accountHolderName || vendor.ownerName || vendor.name || 'N/A'}</td>
                      <td className={cx('px-4 py-4', isDark ? 'text-slate-300' : 'text-slate-600')}>{vendor.email || 'N/A'}</td>
                      <td className={cx('px-4 py-4', isDark ? 'text-slate-300' : 'text-slate-600')}>{vendor.phone || 'N/A'}</td>
                      <td className="px-4 py-4">
                        <span className={cx('inline-flex rounded-full px-3 py-1 text-xs font-semibold', vendor.vendorStatus === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200' : vendor.vendorStatus === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300')}>
                          {vendor.vendorStatus || 'unknown'}
                        </span>
                      </td>
                      <td className={cx('px-4 py-4', isDark ? 'text-slate-300' : 'text-slate-600')}>{vendor.bankName || 'N/A'}</td>
                      <td className={cx('px-4 py-4', isDark ? 'text-slate-300' : 'text-slate-600')}>{vendor.accountNumber || 'N/A'}</td>
                      <td className={cx('px-4 py-4', isDark ? 'text-slate-300' : 'text-slate-600')}>{new Date(vendor.createdAt || Date.now()).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <NotificationToast notifications={notifications} />
      {selectedVendor && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div className={cx('w-full max-w-xl rounded-3xl border bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900')}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-950 dark:text-white">Review pending vendor</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Accept or reject this vendor profile.</p>
              </div>
              <button
                type="button"
                onClick={closeVendorModal}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                ×
              </button>
            </div>

            <div className={cx('mt-6 space-y-4 rounded-3xl border bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950')}>
              <div>
                <p className={cx('text-sm font-semibold uppercase tracking-[0.18em]', isDark ? 'text-slate-400' : 'text-slate-500')}>Vendor</p>
                <p className={cx('mt-1 text-lg font-bold', isDark ? 'text-slate-100' : 'text-slate-900')}>{selectedVendor.brandName || selectedVendor.name}</p>
              </div>
              <div className={cx('grid gap-3 sm:grid-cols-2')}>
                <div className={cx('rounded-2xl border p-4', isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white')}>
                  <p className={cx('text-xs uppercase tracking-[0.16em]', isDark ? 'text-slate-400' : 'text-slate-500')}>Email</p>
                  <p className={cx('mt-2 text-sm', isDark ? 'text-slate-100' : 'text-slate-700')}>{selectedVendor.email}</p>
                </div>
                <div className={cx('rounded-2xl border p-4', isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white')}>
                  <p className={cx('text-xs uppercase tracking-[0.16em]', isDark ? 'text-slate-400' : 'text-slate-500')}>Phone</p>
                  <p className={cx('mt-2 text-sm', isDark ? 'text-slate-100' : 'text-slate-700')}>{selectedVendor.phone || 'N/A'}</p>
                </div>
              </div>
              <div className={cx('rounded-2xl border p-4', isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white')}>
                <p className={cx('text-xs uppercase tracking-[0.16em]', isDark ? 'text-slate-400' : 'text-slate-500')}>Status</p>
                <p className={cx('mt-2 text-sm', isDark ? 'text-slate-100' : 'text-slate-700')}>{selectedVendor.vendorStatus || 'pending'}</p>
              </div>
            </div>

            {showRejectFlow ? (
              <div className="mt-6">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Rejection reason</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  className={cx('mt-2 w-full rounded-3xl border px-4 py-3 text-sm outline-none transition', isDark ? 'border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500' : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-500')}
                  placeholder="Enter a reason for rejection..."
                />
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              {showRejectFlow ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowRejectFlow(false)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleRejectVendor}
                    disabled={actionLoading}
                    className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {actionLoading ? 'Rejecting...' : 'Reject vendor'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setShowRejectFlow(true)}
                    className="w-full rounded-lg border border-red-600 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50 dark:border-red-500 dark:text-red-300 dark:hover:bg-red-500/10 sm:w-auto"
                  >
                    Reject vendor
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApproveVendor(selectedVendor._id || selectedVendor.id)}
                    disabled={actionLoading}
                    className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {actionLoading ? 'Approving...' : 'Approve vendor'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
