// const grid = document.getElementById("minesweeper");
const form = document.querySelector(".form");
const table = document.querySelector(".table");
const gridRowsBody = document.querySelector("#minesweeper");
const allInputs = document.querySelectorAll(".form-control");
const arrayOfAllInputs = Array.from(allInputs);
const submitButton = document.querySelector('.button');
const dashboard = document.querySelector('.partie')
const matrice = [];
const grid = [];
let timerId;
let minesPos;
let gameDone;
let left = 0;
let cheat = false;

const allFilled = (inputs) => {
  // Check that the value of every input is not an empty string
  return inputs.every((input) => {
    return input.value !== "";
  });
};

const enableButton = () => {
  if (allFilled(arrayOfAllInputs)) {
    submitButton.innerHTML = "Play";
    submitButton.disabled = false;
    submitButton.classList.add("button-active");
  } else {
    submitButton.innerHTML = "Please choose grid size";
    submitButton.disabled = true;
    submitButton.classList.remove("button-active");
  }
};
enableButton();

// When input blur or click
allInputs.forEach((input) => {
  input.addEventListener('click', enableButton);
});
allInputs.forEach((input) => {
  input.addEventListener('blur', enableButton);
});

const minesweeperGridCreator = (x) => {
  let id = 0;
  for (let i = 0; i < parseInt(x) ; i++) {
    const tr = document.createElement('tr')

    for (let c = 0; c < parseInt(x); c++) {
      tr.insertAdjacentHTML("beforeend", `<td class='unopened' data-id=${++id} data-x=${i} data-y=${c}></td>`);
    }

    gridRowsBody.appendChild(tr)
  }
}

const revealTiles = (x, y) => {
  // ChatGPT HELP
  
  const actualTile = grid.find(tile => tile.x === x && tile.y === y);

  // Guard clause
  if (!actualTile || actualTile.state === "opened") {
      return;
  }

  actualTile.state = "opened";

  const tileElement = document.querySelector(`[data-id="${actualTile.id}"]`);
  tileElement.classList.remove('unopened');
  tileElement.classList.remove('flagged');
  tileElement.classList.add('opened');

  if (actualTile.value > 0) {
      tileElement.classList.add(`mine-neighbour-${actualTile.value}`);
      return;
  }

  const directions = [
      [-1, -1], [-1, 0], 
      [-1, 1], [0, -1], 
      [0, 1], [1, -1],
      [1, 0], [1, 1]
  ];

  for (const [dx, dy] of directions) {
    revealTiles(x + dx, y + dy);
  }

  minesRefresh()
}

const tilesBehavior = (tiles, minesIds) => {
  if (cheat) {
    const trs = document.querySelectorAll('td');
  
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Control') { 
        trs.forEach((tr) => {
          if (minesPos.includes(parseInt(tr.getAttribute('data-id')))) {
            tr.classList.add('background-red');
          }
        });
      }
    });
  
    document.addEventListener('keyup', (event) => {
      if (event.key === 'Control') {  
        trs.forEach((tr) => {
          if (minesPos.includes(parseInt(tr.getAttribute('data-id')))) {
            tr.classList.remove('background-red');
          }
        });
      }
    });
  }
  tiles.forEach(tile => {
    tile.addEventListener('click', (event) => {
      if (gameDone) return; // Guard Clause
      if (event.target.classList.contains('unopened') && !event.target.classList.contains('flagged')) {
        const id = parseInt(event.target.getAttribute('data-id'));
        event.target.classList.remove('unopened')
        event.target.classList.remove('flagged')
        event.target.classList.add('opened')

        const actualTile = grid.find((tile) => tile.id === id)

        if (actualTile.value === 0) {
          revealTiles(actualTile.x, actualTile.y);
        }
        
        if (actualTile.value > 0) {
          actualTile.state = "opened";
          event.target.classList.add(`mine-neighbour-${actualTile.value}`)
        }

        leftTile()
  
        if (minesIds.includes(id)) {
          gameDone = true;
          displayAllMines();
          console.log('BOOM ! You loose');
          win(false);
          return
        }
        
        if (!parseInt(document.querySelector('.left').lastElementChild.innerText)) {
          gameDone = true;
          displayAllMines();
          console.log('You win !');
          win(true)
          return
        }

      }
    })
    tile.addEventListener('contextmenu', (event) => {
      event.preventDefault()
      if (gameDone) return; // Guard Clause
      if (event.target.classList.contains('unopened')) {
        event.target.classList.contains('flagged') ? event.target.classList.remove('flagged') : event.target.classList.add('flagged')

        const id = parseInt(event.target.getAttribute('data-id'));
        const actualTile = grid.find((tile) => tile.id === id);

        if (actualTile.state === "flagged") {
          actualTile.state = null;
        } else {
          actualTile.state = "flagged";
        }
        
        minesRefresh()
      }
    })
  })
}

const minesRefresh = () => {
  const mines = document.querySelector('.mines').lastElementChild
  const flagged = grid.filter((tile) => tile.state === "flagged").length
  mines.innerHTML = `<span class='${minesPos.length - flagged < 0 ? 'red-error' : null}'>${flagged}</span>/${minesPos.length}`;
}

const displayAllMines = () => {
  const trs = document.querySelectorAll('td');

  trs.forEach((tr) => {
    if (minesPos.includes(parseInt(tr.getAttribute('data-id')))) {
      tr.classList.add('mine')
    }
  })
}

const win = (bool) => {
  const status = document.querySelector('.status')
  status.classList.remove('hide')

  clearInterval(timerId)

  if (bool) {
    status.classList.add('win')
    status.lastElementChild.innerHTML = "You win 😊!"
  } else {
    status.classList.add('loose')
    status.lastElementChild.innerHTML = "You loose 😥!"
  }

  const button = document.createElement('button')
  button.addEventListener('click', () => {
    window.location.reload();
  })
  button.classList.add('button', 'button-active')
  button.innerText = "Retry ?"
  status.appendChild(button)
}

const minesRandomizer = (tileNumber, level) => {
  const difficulty = {1: 0.08, 2: 0.14, 3: 0.20}  
  const minesNumber = Math.floor(tileNumber * difficulty[level]);
  const minesSet = new Set(); 

  while (minesSet.size < minesNumber) {
    const randomPosition = Math.floor(Math.random() * tileNumber);

    if (randomPosition !== 0) {
      minesSet.add(randomPosition);
    } 
  }

  minesPos = Array.from(minesSet);
}

const dashboardStart = (minesNumber, level) => {
  const timer = document.querySelector('.timer').lastElementChild
  const mines = document.querySelector('.mines').lastElementChild
  const difficulty = document.querySelector('.difficulty').lastElementChild
  let minutes = 0;
  let seconds = 1;

  timerId = setInterval(() => {
    if (seconds > 59) {
      seconds = 0;
      minutes++;
    }
    if (minutes === 59 && seconds > 58) {
      clearInterval(timerId)
    }
    timer.innerHTML = `${minutes >= 10 ? minutes : "0" + minutes}:${seconds >= 10 ? seconds++ : "0" + seconds++}`;
  }, 1000);

  const levelDifficulty = ['Easy', 'Medium', 'Hard']

  difficulty.innerHTML = level + ` (${levelDifficulty[level - 1]})`;
  mines.innerHTML = `0/${minesNumber}`;
}

const matriceFeeder = (x) => {
  const tds = document.querySelectorAll('.unopened')
  const offsets = [
    { dx: -1, dy: -1 }, 
    { dx: -1, dy: 0 },
    { dx: -1, dy: 1 }, 
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: 1, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: 1, dy: 1 }
  ];

  for (let i = 0; i < x; i++) {
    matrice.push(Array.from(tds).slice(i * x, (i + 1) * x));
  }  
  
  matrice.forEach((line) => {
    line.forEach((tile) => {
      grid.push({
        x: parseInt(tile.getAttribute('data-x')),
        y: parseInt(tile.getAttribute('data-y')),
        id: parseInt(tile.getAttribute('data-id')),
        value: minesPos.includes(parseInt(tile.getAttribute('data-id'))) ? "M" : 0,
        state: false
      })
    })
  })

  grid.filter(element => element.value === "M").forEach((obj) => {
    offsets.forEach(({ dx, dy }) => {
      const neighbor = grid.find(element => element.x === obj.x + dx && element.y === obj.y + dy);
  
      if (neighbor && typeof neighbor.value === "number") {
        neighbor.value += 1;
      }
    });
  });
}

const leftTile = () => {
  const leftTiles = document.querySelector('.left').lastElementChild
  const tiles = document.querySelectorAll('td')
  
  leftTiles.innerText = (tiles.length - minesPos.length) - grid.filter((tile) => tile.state === "opened").length 
}

// Launch game
submitButton.addEventListener('click', (event) => {
  event.preventDefault();
  form.style.display = "none";
  table.classList.remove("hide");
  table.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });
  dashboard.classList.remove("hide");

  const size = document.getElementById('size').value;
  const level = document.getElementById('difficulty').value;
  cheat = document.getElementById('cheat').checked;

  cheat ? document.querySelector('.cheat').classList.remove('hide') : ""

  minesweeperGridCreator(size);

  const tiles = document.querySelectorAll('td')
  minesRandomizer(tiles.length, level);  
  leftTile()
  dashboardStart(minesPos.length, level);
  matriceFeeder(size);
  tilesBehavior(tiles, minesPos);
});

