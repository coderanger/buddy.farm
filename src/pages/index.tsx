import Layout from '../components/layout'
import { Link } from 'gatsby'
import { DateTime } from "luxon"
import SunCalc from "suncalc"

// These are close but not quite to (x+0.5)/8 thresholds.
// The game must have a very slightly different moon phase computation
// than I am using or there's some floating point fuckery going on. So
// we just have to cope with ugly numbers. These are the averages of the
// extremes of each range as of 2022-03-26.
const marketLevelThresholds = [
  { threshold: 0.186548029946974, level: "Stable", delta: 1000 },
  { threshold: 0.315270295676886, level: "Unstable", delta: 2500 },
  { threshold: 0.439552597908727, level: "Risky", delta: 10000 },
  { threshold: 0.563290665191551, level: "Wild", delta: 25000 },
  { threshold: 0.688827541911547, level: "Risky", delta: 10000 },
  { threshold: 0.817178892856435, level: "Unstable", delta: 2500 },
  { threshold: 1, level: "Stable", delta: 1000 },
]

const marketLevel = (date: DateTime) => {
  const moon = SunCalc.getMoonIllumination(date.toJSDate())
  for (const market of marketLevelThresholds) {
    if (moon.phase < market.threshold) {
      return market
    }
  }
  // This should be impossible.
  return marketLevelThresholds[0]
}

export default () => {
  window.phase = (year: number, month: number, day: number) => SunCalc.getMoonIllumination(new Date(year, month - 1, day)).phase
  return <Layout pageTitle="Buddy's Almanac">
    <h1>Welcome to Buddy's Almanac</h1>
    <div>
      <p>This is a repository of game information for <a href="https://farmrpg.com/">FarmRPG</a>.</p>
      <p>
        We're still getting set up so please be patient as new features are added. For now you can look up drop rates for
        items and locations.
      </p>
      <p>
        Check out the <Link to="/settings/">settings</Link> to configure your perks and other settings.
      </p>
      <p>
        Please contact Coderanger in-game or on Discord with any questions or feedback.
      </p>
      <table>{Array.from({ length: 300 }, (x, i) => i).map(i => {
        const date = DateTime.now().setZone("America/Chicago").startOf("day").plus({ minutes: 1 }).minus({ days: i + 1 })
        const moon = SunCalc.getMoonIllumination(date.toJSDate())
        return <tr key={date.toISO()}><td>{date.toISO()}</td><td>{moon.phase}</td><td>{marketLevel(date).level}</td></tr>
      })}</table>
    </div>
  </Layout >
}
