import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container footer-grid">
        <div className="footer-col">
          <Link className="brand footer-brand" href="/">PGV</Link>
          <p className="muted">Vlastovy stránky — přehledně a moderně.</p>
        </div>
        <div className="footer-col">
          <h4>Kontakt</h4>
          <address>
            <div>novak@seto.cz</div>
            <div>Telefon: +420 608 720 672</div>
          </address>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
         Vytvořil <a href="https://www.jirimacal.cz" target="_blank" rel="noopener">Jiří Macal</a>
        </p>
        <p>&copy; PGV • Všechna práva vyhrazena</p>
      </div>
    </footer>
  )
}
