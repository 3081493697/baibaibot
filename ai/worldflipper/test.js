const bbp = require('./BossBattlePushing')

const c = m => {
  console.log('===== output =====')
  console.log(m)
}
setTimeout(() => {
  let con = 'wfp'
  let fie = con.substring(0, 3), from = 799018865, callback = c
  if(fie.toLowerCase() == 'ark'){
    switch(con.substring(3, 4)){
      case 's':
      case 'S':
        // ans(from, con.substring(4), callback)
        break;
      case 'e':
      case 'E':
        // anc(from, con.substring(4), callback)
        break;
      case 'd':
      case 'D':
        // and(from, con.substring(4), callback)
        break;
      case 'c':
      case 'C':
        // anchan(con.substring(4), callback)
        break;
      default:
      // anr(from, con.substring(3), callback)
    }
    return
  }
  if(fie.toLowerCase() == 'wfp'){
    bbp(con.substring(3), from, callback)
    return
  }

  // bbp('', 799018865, c)
}, 10000)