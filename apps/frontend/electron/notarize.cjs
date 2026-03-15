const { execFileSync } = require('node:child_process')
const { existsSync } = require('node:fs')
const path = require('node:path')

function hasNotarizeCredentials() {
  return (
    Boolean(process.env.APPLE_ID) &&
    Boolean(process.env.APPLE_APP_SPECIFIC_PASSWORD) &&
    Boolean(process.env.APPLE_TEAM_ID)
  )
}

exports.default = async function notarize(context) {
  if (process.platform !== 'darwin') {
    return
  }

  if (process.env.SKIP_NOTARIZE === 'true') {
    console.log('[notarize] SKIP_NOTARIZE=true, skip notarization.')
    return
  }

  if (!hasNotarizeCredentials()) {
    console.log('[notarize] Missing APPLE_ID / APPLE_APP_SPECIFIC_PASSWORD / APPLE_TEAM_ID, skip notarization.')
    return
  }

  const appName = context.packager.appInfo.productFilename
  const appPath = path.join(context.appOutDir, `${appName}.app`)

  if (!existsSync(appPath)) {
    throw new Error(`[notarize] Application not found at ${appPath}`)
  }

  console.log(`[notarize] Submitting ${appPath} ...`)
  execFileSync(
    'xcrun',
    [
      'notarytool',
      'submit',
      appPath,
      '--apple-id',
      process.env.APPLE_ID,
      '--password',
      process.env.APPLE_APP_SPECIFIC_PASSWORD,
      '--team-id',
      process.env.APPLE_TEAM_ID,
      '--wait',
    ],
    { stdio: 'inherit' },
  )

  console.log(`[notarize] Stapling ${appPath} ...`)
  execFileSync('xcrun', ['stapler', 'staple', appPath], { stdio: 'inherit' })
}
