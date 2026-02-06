import fetch from 'node-fetch'
import { getDevice } from '@whiskeysockets/baileys'
import fs from 'fs'
import axios from 'axios'
import moment from 'moment-timezone'
import { bodyMenu, menuObject } from '../../lib/commands.js'

function normalize(text = '') {
  text = text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
  return text.endsWith('s') ? text.slice(0, -1) : text
}

export default {
  command: ['allmenu', 'help', 'menu'],
  category: 'info',
  run: async (client, m, args, usedPrefix, command) => {
    try {
      const now = new Date()
      const colombianTime = new Date(
        now.toLocaleString('en-US', { timeZone: 'America/Caracas' })
      )

      const tiempo = colombianTime
        .toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
        .replace(/,/g, '')

      const tempo = moment.tz('America/Caracas').format('hh:mm A')

      const botId = client?.user?.id.split(':')[0] + '@s.whatsapp.net'
      const botSettings = global.db.data.settings[botId] || {}

      const botname = botSettings.botname || ''
      const namebot = botSettings.namebot || ''
      const owner = botSettings.owner || ''
      const canalId = botSettings.id || ''
      const canalName = botSettings.nameid || ''
      const link = botSettings.link || 'https://whatsapp.com/channel/0029VbApwZ9ISTkEBb6ttS3F'

      const isOficialBot =
        botId === global.client.user.id.split(':')[0] + '@s.whatsapp.net'

      const botType = isOficialBot ? 'Principal/Owner' : 'Sub Bot'
      const users = Object.keys(global.db.data.users).length
      const device = getDevice(m.key.id)
      const sender = global.db.data.users[m.sender]?.name || 'Usuario'
      const time = client.uptime
        ? formatearMs(Date.now() - client.uptime)
        : 'Desconocido'

      // 🖼️ IMAGEN ÚNICA DEL MENÚ (LA TUYA)
      const menuImage =
        'https://i.postimg.cc/q7vKvdTj/SAVE-20260205-191658.jpg'

      const alias = {
        anime: ['anime', 'reacciones'],
        downloads: ['downloads', 'descargas'],
        economia: ['economia', 'economy', 'eco'],
        gacha: ['gacha', 'rpg'],
        grupo: ['grupo', 'group'],
        nsfw: ['nsfw', '+18'],
        profile: ['profile', 'perfil'],
        sockets: ['sockets', 'bots'],
        utils: ['utils', 'utilidades', 'herramientas']
      }

      const input = normalize(args[0] || '')
      const cat = Object.keys(alias).find(k =>
        alias[k].map(normalize).includes(input)
      )

      const category = `${cat ? ` para \`${cat}\`` : '. *(˶ᵔ ᵕ ᵔ˶)*'}`

      if (args[0] && !cat) {
        return m.reply(
          `《✧》 La categoría *${args[0]}* no existe.\n\n` +
          `Categorías disponibles:\n*${Object.keys(alias).join(', ')}*\n\n` +
          `• ${usedPrefix}menu\n• ${usedPrefix}menu anime`
        )
      }

      const sections = menuObject
      const content = cat
        ? String(sections[cat] || '')
        : Object.values(sections).map(s => String(s || '')).join('\n\n')

      let menu = bodyMenu
        ? String(bodyMenu || '') + '\n\n' + content
        : content

      const replacements = {
        $owner: owner
          ? (!isNaN(owner.replace(/@s\.whatsapp\.net$/, ''))
              ? global.db.data.users[owner]?.name || owner.split('@')[0]
              : owner)
          : 'Oculto',
        $botType: botType,
        $device: device,
        $tiempo: tiempo,
        $tempo: tempo,
        $users: users.toLocaleString(),
        $link: link,
        $cat: category,
        $sender: sender,
        $botname: botname,
        $namebot: namebot,
        $prefix: usedPrefix,
        $uptime: time
      }

      for (const [key, value] of Object.entries(replacements)) {
        menu = menu.replace(new RegExp(`\\${key}`, 'g'), value)
      }

      // ✅ ENVÍO FINAL: UNA SOLA IMAGEN, SIN DUPLICADOS
      await client.sendMessage(
        m.chat,
        {
          image: { url: menuImage },
          caption: menu,
          contextInfo: {
            mentionedJid: [m.sender]
          }
        },
        { quoted: m }
      )

    } catch (e) {
      await m.reply(`❌ Error:\n${e.message}`)
    }
  }
}

function formatearMs(ms) {
  const segundos = Math.floor(ms / 1000)
  const minutos = Math.floor(segundos / 60)
  const horas = Math.floor(minutos / 60)
  const dias = Math.floor(horas / 24)

  return [
    dias && `${dias}d`,
    `${horas % 24}h`,
    `${minutos % 60}m`,
    `${segundos % 60}s`
  ]
    .filter(Boolean)
    .join(' ')
}