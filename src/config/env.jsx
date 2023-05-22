import * as dotenv from 'dotenv'

const conf = dotenv.config({
    path: '.env' 
})

export {
    conf
}