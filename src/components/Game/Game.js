import React, { Component } from 'react'
import 'whatwg-fetch'
import _ from 'lodash'

import Timer from '../Timer/Timer'
import styles from './Game.scss'

class Game extends Component {
  constructor (props) {
    super(props)

    this.state = {
      levels: [],
      game: {
        cards: []
      },
      selected: {},
      matched: {},
      sounds: {},
      tries: 0
    }

    this.endResult = this.endResult.bind(this)
  }

  componentDidMount () {
    const _this = this

    if (fetch) {
      fetch('https://web-code-test-dot-nyt-games-prd.appspot.com/cards.json')
        .then(response => response.json())
        .then(body => _this.setState({ levels: body.levels }))
    }
  }

  startGame (diff) {
    const { levels } = this.state
    let cards = []

    levels[diff].cards.forEach(card => {
      cards = [...cards, { symbol: card }]
    })

    cards = _.shuffle(cards)

    this.setState({
      tries: 10,
      matched: {},
      selected: {},
      game: { diff, cards }
    })
  }

  checkMatch () {
    let { selected, game, tries, matched } = this.state
    const values = Object.values(selected)

    if (values.length === 2) {
      this.setState({ disabled: true, tries: tries -= 1 })

      setTimeout(() => {
        if (values[0] === values[1]) {
          Object.keys(selected).forEach(key => { matched[key] = selected[key] })
        }

        this.setState({
          game,
          selected: {},
          disabled: false
        })
      }, 1000)
    }
  }

  toggleCard (e, symbol, i) {
    let { selected } = this.state

    this.playSound('flip')

    if (selected[i]) return

    selected[i] = symbol
    this.setState({ selected })
    this.checkMatch()
  }

  playSound (id) {
    document.getElementById(id).play()
  }

  endResult () {
    const { matched, game, tries } = this.state
    const fullMatch = Object.keys(matched).length === game.cards.length
    if (!tries && !fullMatch) return 'fail'
    if (fullMatch && game.cards.length) return 'victory'
  }

  render () {
    const { game, selected, disabled, tries, matched } = this.state
    const { endResult } = this

    return (
      <div className={styles.container}>
        <audio id="flip" src="https://www.dropbox.com/s/fzh5xkba9vo6q49/FX_GameStart20_CardDealSingle.ogg?dl=1" autostart="false" ></audio>
        <h1 className={styles.header}>NYT Memory Game</h1>

        <div className={styles.buttonwrap}>
          <div className={`${styles.button} ${disabled ? styles.disabled : ''}`} onClick={() => this.startGame(0)}>EASY</div>
          <div className={`${styles.button} ${disabled ? styles.disabled : ''}`} onClick={() => this.startGame(1)}>HARD</div>
        </div>
        <div className={`${styles.game} ${game.cards.length ? '' : styles.hide} `}>
          <div className={styles.infowrap}>
            <div className={styles.info}>MOVES LEFT: {tries}</div>
            <Timer />
          </div>

          { endResult() === 'fail'
            ? <div className={styles.failure}>Game Over!</div>
            : null
          }

          {endResult() === 'victory'
            ? <div className={styles.victory}>Victory is yours!</div>
            : null
          }

          <div className={`${styles.board} ${disabled || !tries ? styles.disabled : ''} `}>
              {game.cards.map((card, i) => {
                return (
                  <div
                    key={i}
                    className={styles.card}
                    onClick={(e) => this.toggleCard(e, card.symbol, i)}>
                    <div className={`${styles.flipwrap} ${selected[i] || matched[i] ? styles.flip : ''}`}>
                      <div className={styles.front}>
                        <svg className={styles.logo} xmlns="http://www.w3.org/2000/svg" id="icon-times" viewBox="0 0 54 54">
                          <title>nytT_54x54_svg_04032017</title>
                          <path fill="#fff" d="M41.84,31.58A12.15,12.15,0,0,1,35,38.79V31.58l4-3.55-4-3.51v-5a6.24,6.24,0,0,0,6.11-6.16c0-4.25-4.05-5.75-6.36-5.75a6.87,6.87,0,0,0-1.82.2V8c0.3,0,.75-0.05.91-0.05,1.6,0,2.81.75,2.81,2.2a2.3,2.3,0,0,1-2.39,2.21H34.13c-4,0-8.62-3.21-13.63-3.21-4.54,0-7.61,3.35-7.61,6.76s1.85,4.44,3.93,5.21l0.05-.2a2.39,2.39,0,0,1-1.1-2.2A3,3,0,0,1,18.92,16c4.25,0,11.12,3.55,15.37,3.55h0.44v5l-4,3.45,4,3.55v7.27a14.82,14.82,0,0,1-5.11.85C23,39.69,18.8,35.68,18.8,29a16,16,0,0,1,.65-4.65l3.31-1.45V37.64l6.71-3v-15l-9.91,4.41a10.74,10.74,0,0,1,5.51-6.21L25,17.71c-6.61,1.45-13,6.46-13,14,0,8.69,7.27,14.67,15.82,14.67,9,0,14.17-6,14.17-14.77H41.84Z"/>
                        </svg>
                      </div>
                      <div className={styles.back}>{card.symbol}</div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    )
  }
}

export default Game
