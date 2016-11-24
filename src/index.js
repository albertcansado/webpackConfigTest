const hola = (num) => {
    console.log("Total", num)
}

let total = 0
for (let i = 0; i < 10; i++) {
    total += i * Math.random() + 1
}

hola(total)
