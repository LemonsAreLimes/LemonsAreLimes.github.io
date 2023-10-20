async function get_collection_ids(collection, count=10){

  // the response of this function will be chached
  // to reduce the number of requests to internet archive 
  // if the entirety of the chache has been used up, page++
  // in the event that we are requesting more than one collection, lower rowcount 

  //TODO: add condition to use only tagged with english 

  let url = `https://archive.org/advancedsearch.php?q=collection%3A%22${collection}%22&fl[]=identifier&rows=${count}&page=$${page=1}&output=json`
  let res = await (await fetch(url, { method: 'GET' })).json()

  // console.log(res["response"]["docs"])

  let links = []
  for ( i in res["response"]["docs"] ){
    links.push(res["response"]["docs"][i]["identifier"])
  }

  return links 
}

async function get_readable_url(identifier){
  let dl_page_url = "https://archive.org/download/" + identifier
  let res = await (await fetch(dl_page_url, { method: 'GET' })).text()
  let urls_found = res.match(/<td><a href=".+mp4"/g) 

  //this could be improved, maybe with another regex thing
  //essentially removes the .ia.mp4 files and parses the 
  //string into something we can actually use
  let dl_exts = []
  for ( i in urls_found ) {
    if (urls_found[i].includes(".ia.")){ continue }
    
    let dl_ext = urls_found[i]
      .replace(`<td><a href="`, "")
      .replace(`"`, "")

    dl_exts.push(dl_ext)
  }

  //we could use a random item from the found, but im not going to do that rn
  //we only really need 1 url at this time
  let readable_url = dl_page_url + "/" + dl_exts[0]
  if ( dl_exts.length == 0 ) { return false }  // in the case that nothing was found
  return readable_url
}

async function collectionToDlUrls(collection){
  
  let ids = await get_collection_ids(collection, 10)

  let dl_links = []
  for ( i in ids ){
    let dl_link = await get_readable_url(ids[i])
    if (dl_link){ 
      dl_links.push(dl_link)
      console.log("link added")
    }
  }

  return dl_links
}

async function getAllCollections(collections){
  
  let data = []
  for ( i in collections ){ 
    let curr = collections[i]
    console.log(curr)

    let links = await collectionToDlUrls(curr)
    let struct = {
      "name": curr,
      "data": links
    }

    data.push(struct)
  }

  return data
}


const {writeFileSync} = require("fs")

//Internet archive collections (this is not an exhaustive list)
let collections = [
  "television",
  "moviesandfilms",
  "animefansubs",
  "anime_miscellaneous",
  "vhscommercials",
  "vhsvault_inbox",
  "vhsinstructionals",
  "vhsmisc",
  "television_inbox",
  "animation_unsorted",
  "more_animation",
  "classic_cartoons",
  "vintage_cartoons",
  "saturdaynightlive"
]

getAllCollections(collections).then(res => {
  console.log(res)
  writeFileSync("./IA_links.json", JSON.stringify(res))
})

// get_readable_url("bill-teds-excellent-adventures-s02e01")
//   .then(url => console.log(url))

// let rand_percent = Math.floor(Math.random() * 100) / 100
// let length = 12000
// console.log(Math.floor(Math.random() * 5))
