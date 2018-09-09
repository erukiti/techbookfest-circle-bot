const client = require('cheerio-httpcli')
const dotenv = require('dotenv')
const tough = require('tough-cookie')
const rp = require('request-promise')

dotenv.config()
const email = process.env.EMAIL
const password = process.env.PASSWORD
const webhook = process.env.SLACK_WEBHOOK
const channel = process.env.SLACK_CHANNEL

const fetchCheckedCount = async userToken => {
  const cookie = new tough.Cookie({
    key: 'user',
    value: userToken,
    path: '/',
    domain: 'techbookfest.org'
  })
  const jar = rp.jar()
  jar.setCookie(cookie.toString(), 'https://techbookfest.org')
  const opt = {
    url: 'https://techbookfest.org/api/circle/own',
    jar
  }
  const circles = JSON.parse(await rp(opt))
  // console.log(circles)
  const checkedCount = circles.filter(circle => circle.event.id === 'tbf05').map(circle => circle.checkedCount)[0]
  return checkedCount
}

const re = /^user=([^;]+)/

const signIn = async () => {
  const opt = {
    method: 'POST',
    uri: 'https://techbookfest.org/api/user/login',
    body: JSON.stringify({ email, password }),
    headers: {
      'content-type': 'application/json'
    },
    resolveWithFullResponse: true
  }
  const res = await rp(opt)
  const matched = re.exec(res.headers['set-cookie'][0])
  if (!matched) {
    throw new Error(`login failed or Bug??? ${res.headers}`)
  }
  return matched[1]
}

const crawl = async () => {
  const userToken = await signIn()
  const checkedCount = await fetchCheckedCount(userToken)
  return checkedCount
}

const sendToSlack = async message => {
  const opt = {
    method: 'POST',
    uri: webhook,
    json: {
      channel,
      text: message
    }
  }
  await rp(opt)
}

const sendCheckedcountToSlack = async () => {
  const checkedCount = await crawl()
  await sendToSlack(`被サークルチェック数: ${checkedCount}`)
  return checkedCount
}

const sleep = count =>
  new Promise((resolve, reject) => {
    setTimeout(() => resolve(), count)
  })

const bot = async hourly => {
  for (;;) {
    const checkedCount = await sendCheckedcountToSlack()
    console.log(new Date().toLocaleString(), checkedCount)
    await sleep(1000 * 60 * 60 * hourly)
  }
}

bot(6).catch(err => console.log(err))
