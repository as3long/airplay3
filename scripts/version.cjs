#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const pkgPath = path.join(root, 'package.json')
const cargoPath = path.join(root, 'src-tauri', 'Cargo.toml')
const tauriPath = path.join(root, 'src-tauri', 'tauri.conf.json')

function getCurrentVersion() {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  return pkg.version
}

function bumpPatch(version) {
  const parts = version.split('.')
  parts[2] = String(parseInt(parts[2]) + 1)
  return parts.join('.')
}

function getVersion() {
  const current = getCurrentVersion()
  const arg = process.argv[2]

  if (!arg) {
    const bumped = bumpPatch(current)
    console.log(`Current: ${current}`)
    console.log(`Bumping patch: ${bumped}`)
    return bumped
  }

  if (!/^\d+\.\d+\.\d+/.test(arg)) {
    console.error('Invalid version format. Use: x.y.z')
    process.exit(1)
  }
  return arg
}

function updatePackageJson(version) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  pkg.version = version
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  console.log(`✓ package.json → ${version}`)
}

function updateCargoToml(version) {
  let content = fs.readFileSync(cargoPath, 'utf8')
  content = content.replace(/^(version\s*=\s*)"[^"]*"/m, `$1"${version}"`)
  fs.writeFileSync(cargoPath, content)
  console.log(`✓ Cargo.toml → ${version}`)
}

function updateTauriConf(version) {
  const conf = JSON.parse(fs.readFileSync(tauriPath, 'utf8'))
  conf.version = version
  fs.writeFileSync(tauriPath, JSON.stringify(conf, null, 2) + '\n')
  console.log(`✓ tauri.conf.json → ${version}`)
}

const version = getVersion()
updatePackageJson(version)
updateCargoToml(version)
updateTauriConf(version)
console.log(`\nDone! All versions set to ${version}`)
