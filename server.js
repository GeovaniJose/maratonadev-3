// Configurar o servidor
require('dotenv').config()
const express = require('express')
const server = express()

// Configurar o servidor para apresentar arquivos estáticos
server.use(express.static('public'))

// Habilitar body do formulário
server.use(express.urlencoded({ extended: true }))

// Configurar a conexão com o banco de dados
const { Pool } = require('pg')
const db = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: 5433,
  database: process.env.DB_NAME
})

// Configurar a template engine
const nunjucks = require('nunjucks')
nunjucks.configure('./', {
  express: server,
  noCache: true
})

// Conigurar a apresentação da página erro
server.get('/erro', (req, res) => {
  db.query(`SELECT * FROM donors`, (err, result) => {
    // Fluxo de erro
    if (err) return res.send('Erro no banco de dados.')

    // Fluxo ideal
    const donors = result.rows
    return res.render('index.html', {
      donors,
      erro: 'Todos os campos são obrigatórios.'
    })
  })
})

// Conigurar a apresentação da página
server.get('/', (req, res) => {
  db.query(`SELECT * FROM donors`, (err, result) => {
    // Fluxo de erro
    if (err) return res.send('Erro no banco de dados.')

    // Fluxo ideal
    const donors = result.rows
    return res.render('index.html', { donors })
  })
})

// eslint-disable-next-line consistent-return
server.post('/', (req, res) => {
  // Pegar dados do fomrulário
  const { name } = req.body
  const { email } = req.body
  const { blood } = req.body

  // Se o name ou email ou blood igual a vazio
  if (name === '' || email === '' || blood === '') {
    return res.redirect('/erro')
  }

  // Colocar valores dentro do bd
  const query = `
    INSERT INTO donors ("name", "email", "blood")
    VALUES ($1, $2, $3)`
  const values = [name, email, blood]

  db.query(query, values, err => {
    // Fluxo de erro
    if (err) return res.send('Erro no banco de dados.')

    // Fluxo ideal
    return res.redirect('/')
  })
})

// Start server on port 3000
server.listen(3000, () => console.log('Server running...'))
