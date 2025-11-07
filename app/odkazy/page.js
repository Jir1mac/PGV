'use client'

import Layout from '../../components/Layout'

export default function Odkazy() {
  const linkCategories = [
    {
      title: 'LÉTACÍ',
      id: 'col-letaci',
      links: [
        { href: 'https://www.pgweb.cz', label: 'Fórum PG web' },
        { href: 'https://www.elspeedo.cz', label: 'Elspeedo' },
        { href: 'https://www.cloudbase-hunters.cz', label: 'Cloudbase Hunters' },
        { href: 'https://www.laacr.cz', label: 'LAA ČR' },
        { href: 'https://www.pgbaraka.cz', label: 'Baraka Paragliding' },
        { href: 'https://www.pgkrupka.cz', label: 'PG Krupka' },
        { href: 'http://www.jezevcoviny.net', label: 'Raná (Jezevcoviny)' },
        { href: 'https://www.aircentrum.cz', label: 'AIR CENTRUM' },
        { href: 'https://www.goparagliding.cz', label: 'GO Paragliding' },
        { href: 'https://www.tandemy.cz', label: 'Tandemy na Vysočině' },
        { href: 'https://www.skyfly.cz', label: 'SkyFly' },
      ]
    },
    {
      title: 'POČASÍ',
      id: 'col-pocasi',
      links: [
        { href: 'https://portal.chmi.cz', label: 'ČHMÚ (počasí)' },
        { href: 'https://www.aeroweb.cz', label: 'Aeroweb' },
        { href: 'https://www.flightradar24.com', label: 'Flightradar24' },
        { href: 'https://calendar.zoznam.sk/sun.php', label: 'Východ a západ slunce' },
        { href: 'https://www.dopravniinfo.cz', label: 'Dopravní info' },
        { href: 'https://www.gpxmapy.cz', label: 'GPXmapy.cz' },
        { href: 'https://www.nepalxc.cz', label: 'NepalXC' },
        { href: 'https://www.spvletohrad.cz', label: 'SPV Letohrad (počasí/aktivity)' },
        { href: 'https://www.xcontest.org', label: 'XContest (live)' },
      ]
    },
    {
      title: 'SOUTĚŽE',
      id: 'col-souteze',
      links: [
        { href: 'https://www.xcontest.org', label: 'XContest (CZ / World / Live)' },
        { href: 'https://www.adrenalincup.com', label: 'Adrenalin Cup' },
        { href: 'https://paramotors.xcontest.org', label: 'Paramotors XContest' },
        { href: 'https://www.fotosoutez.laacr.cz', label: 'Fotosoutěž LAA ČR' },
        { href: 'https://video-soutez.aircentrum.cz', label: 'Video soutěž (Aircentrum)' },
        { href: 'https://www.pgweb.cz', label: 'LIVE! / fórum & závody' },
        { href: 'https://xalpsteam.cz', label: 'X-Alps Team' },
        { href: 'https://www.gpxmapy.cz', label: 'GPX mapy (soutěže/trasy)' },
      ]
    },
    {
      title: 'RŮZNÉ',
      id: 'col-ruzne',
      links: [
        { href: 'https://cs.wikipedia.org/wiki/Paragliding', label: 'Co je Paragliding' },
        { href: 'https://www.eparagliding.cz', label: 'E-paragliding (testy / výuka)' },
        { href: 'https://skoleni.laacr.cz', label: 'Školení LAA ČR' },
        { href: 'https://zkouseni.laacr.cz', label: 'Zkoušení LAA ČR' },
        { href: 'https://www.caa.cz', label: 'ÚCL (CAA)' },
        { href: 'https://www.proglide.cz', label: 'Proglide' },
        { href: 'https://www.u-turn.de', label: 'U-TURN (výrobce)' },
        { href: 'https://www.pgpalava.cz', label: 'Vlastův Velký Výlet / Puczok' },
        { href: 'https://www.davidbzirsky.com', label: 'David Bzirský' },
        { href: 'https://www.zevzduchu.cz', label: 'Zevzduchu.cz' },
        { href: 'https://www.paragliding-tandem.cz', label: 'Tandemy na Vysočině' },
        { href: 'https://www.marecek.cz', label: 'Mareček.cz' },
        { href: 'https://www.paragliding-4u.cz', label: 'Paragliding-4U' },
        { href: 'https://www.pgshop.cz', label: 'PG-shop.cz' },
      ]
    },
    {
      title: 'MAPY, WEBCAMY',
      id: 'col-mapy',
      links: [
        { href: 'https://mapy.cz', label: 'Mapy.cz' },
        { href: 'https://www.dl.cz', label: 'Letecká mapa ČR (DL.cz)' },
        { href: 'https://www.paragliding-mapa.cz', label: 'Paragliding - mapy' },
        { href: 'https://mapy.veetek.net', label: 'Veetek mapy' },
        { href: 'https://pgmapa.ifire.cz', label: 'PG mapa (ifire)' },
        { href: 'https://www.gpxmapy.cz', label: 'GPXmapy.cz' },
        { href: 'https://aisview.rlp.cz', label: 'AIS View (aktivované prostory)' },
        { href: 'https://www.proglide.cz', label: 'Prostory, startovačky, webkamery' },
        { href: 'https://www.rana-paragliding.cz', label: 'Raná — letiště / webkamery' },
        { href: 'https://www.pgweb.cz', label: 'Startovačky PG (vyhledávání)' },
      ]
    },
  ]

  return (
    <Layout>
      <main className="container">
        <h1>Odkazy</h1>
        <p className="lead">Užitečné odkazy a zdroje — přehledně rozdělené do kategorií.</p>

        <div className="links-grid" role="list">
          {linkCategories.map((category) => (
            <section key={category.id} className="links-col" aria-labelledby={category.id}>
              <h3 id={category.id}>{category.title}</h3>
              <ul>
                {category.links.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} target="_blank" rel="noopener">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
    </Layout>
  )
}
