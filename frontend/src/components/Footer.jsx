import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const cx = (...classes) => classes.filter(Boolean).join(' ')

export default function Footer() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const muted = isDark ? 'text-slate-400' : 'text-slate-500'
  const link = cx('text-sm transition hover:text-violet-600', muted)

  return (
    <footer className={cx('mt-12 border-t px-4 py-12 sm:px-6 lg:px-8', isDark ? 'border-white/10 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-950')}>
      <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h4 className="text-lg font-black">CampusThread</h4>
          <p className={cx('mt-3 text-sm leading-6', muted)}>Campus apparel, vendor stores, and student-made products in one marketplace.</p>
        </div>
        <FooterGroup title="Shop">
          <Link to="/shop" className={link}>All Products</Link>
          <Link to="/shop" className={link}>By University</Link>
          <Link to="/explore" className={link}>By Brand</Link>
        </FooterGroup>
        <FooterGroup title="For Vendors">
          <Link to="/vendor-admin" className={link}>Vendor Admin</Link>
          <Link to="/auth" className={link}>Become a Vendor</Link>
          <a href="#" className={link}>Vendor Guide</a>
        </FooterGroup>
        <FooterGroup title="Follow Us">
          {['Twitter', 'Instagram', 'Facebook'].map((item) => (
            <a key={item} href="#" className={link}>{item}</a>
          ))}
        </FooterGroup>
      </div>
      <div className={cx('mx-auto mt-10 max-w-7xl border-t pt-8 text-center text-sm', isDark ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500')}>
        &copy; 2024 CampusThread. All rights reserved.
      </div>
    </footer>
  )
}

function FooterGroup({ title, children }) {
  return (
    <div>
      <h4 className="text-lg font-black">{title}</h4>
      <div className="mt-3 grid gap-2">{children}</div>
    </div>
  )
}
