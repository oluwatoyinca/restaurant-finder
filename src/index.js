const app = require('./app')
//env variable 'PORT' is defined in dev.env
const port = 3000

app.listen(port, () => {
    console.log('Server is up on port '+port)
})