import Layout from '../components/layout'
import { Link } from 'gatsby'

export default () => (
  <Layout pageTitle="Buddy's Almanac">
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
    </div>
  </Layout>
)
