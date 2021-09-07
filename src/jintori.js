'use strict';
// // 標準的なpolyfillをインストール
// import 'core-js/stable';
// // 必要なpolyfillをインストール

// // fontawesomeインストール
// import {config, dom, library} from '@fortawesome/fontawesome-svg-core';
// import {

// } from '@fortawesome/free-solid-svg-icons';
// import {

// } from '@fortawesome/free-regular-svg-icons-svg-icons';
// import {

// } from '@fortawesome/free-brands-svg-icons';
// // アイコンが見つからない場合の挙動 ?マークがアニメーション
// config.showMissingIcons = true;
// // 上記3行で記載したアイコンをライブラリに追加
// library.add(

// );
// // <i>タグを<svg>タグに変換
// dom.watch();

// 要素の取得
const current_turn = document.querySelector('.current-turn');
const cells = document.querySelectorAll('.cell');
const words = document.querySelectorAll('.word');
const answer_input = document.querySelector('.answer-input');
const answer_btn = document.querySelector('.answer-btn');
const reset_btn = document.querySelector('.reset-btn');
const current_scores = document.querySelectorAll('.current-score');
const answered_list = document.querySelectorAll('.answered-list');

// 変数定義
let turn = -1;
const turn_color = {
  '-1': 'red',
  '1': 'blue'
};
const turn_list = {
  '-1': '0',
  '1': '1'
};
let red_count;
let blue_count;
let answers = [];
const dictionary_url = ''

// ゲーム処理
cells.forEach(function(cell) {
  cell.addEventListener('click', function() {
    // 漢字を変数定義
    let word = cell.childNodes[1].textContent;
    // クリックしたマスが自分の色の場合アラート
    if(cell.classList.contains(turn_color[turn])) {
      alert('そこには置けません');
      return;
    }
    // クリックしたマスを可視化し、入力欄に追加
    if(cell.classList.contains('selected') === false) {
      cell.classList.add('selected');
      answers.push(word.trim());
      answer_input.textContent += word.trim();
    // 再度クリックで不可視化、入力欄から削除
    } else {
      cell.classList.remove('selected');
      answers.splice(answers.indexOf(word.trim()), 1);
      answer_input.textContent = '';
      answers.forEach(function(answer) {
        answer_input.textContent += answer;
      })
    }
  })
})

// ターン交代
function change_turn() {
  turn *= -1;
  current_turn.classList.remove(turn_color[turn * -1]);
  current_turn.classList.add(turn_color[turn]);
}

// リセット
function reset() {
  cells.forEach(function(cell) {
    answers = [];
    answer_input.textContent = '';
    if(cell.classList.contains('selected') === true) {
      cell.classList.remove('selected');
    }
  })
}

// 現在の獲得マス数を更新
function masu_count() {
  red_count = 0;
  blue_count = 0;
  cells.forEach(function(cell) {
    if(cell.classList.contains('red')) {
      red_count ++;
    } else if(cell.classList.contains('blue')) {
      blue_count ++;
    }
  })
  current_scores[0].textContent = red_count;
  current_scores[1].textContent = blue_count;
}

// 盤面の確認 強制ターン交代 ゲーム終了
function field_check() {
  let white_cells = document.querySelectorAll('.white');
  let opponent_cells = document.querySelectorAll('.' + turn_color[turn * -1]);
  // 強制ターン交代
  if(white_cells.length === 1 && opponent_cells.length === 0) {
    alert('置けるマスがありません\nターンが代わります');
    change_turn();
  }
  // ゲーム終了
  if(white_cells.length === 0) {
    if(red_count > blue_count) {
      alert('赤の勝利です');
    } else if(red_count < blue_count) {
      alert('青の勝利です');
    } else {
      alert('引き分けです');
    }
  }
}

// 解答ボタン
answer_btn.addEventListener('click', function() {
  let white_counter = 0;
  let words = answer_input.textContent;
  // 選択されたマスに白マスが含まれているか確認
  let selected_cells = document.querySelectorAll('.selected');
  selected_cells.forEach(function(selected_cell) {
    if(selected_cell.classList.contains('white')) {
      white_counter ++;
    }
  })
  if(white_counter !== 0 && selected_cells.length >= 2) {
    // 正誤判定
    jQuery.ajax({
      type: 'POST',
      url: ajaxurl,
      data: {
        'action': 'dictionary',
        'value': words
      },
      cache: false,
      success: function(response){
        let results = JSON.parse(response);
        // 正解の場合
        if(results !== null) {
          cells.forEach(function(cell) {
            if(cell.classList.contains('selected')) {
              cell.classList.remove('white');
              cell.classList.remove(turn_color[turn * -1]);
              cell.classList.add(turn_color[turn]);
            }
          })
          // 解答した熟語をリストで表示
          let li = document.createElement('li');
          answered_list[turn_list[turn]].appendChild(li);
          let a = document.createElement('a');
          a.textContent = results['kotoba'] + '（' + results['yomi'] + '）';
          let href = 'https://dictionary.goo.ne.jp' + results['link'];
          a.setAttribute('href', href);
          a.setAttribute('target', '_blank');
          a.classList.add('link');
          li.appendChild(a);
        // 不正解の場合
        } else {
          alert('不正解です。');
        }
        reset();
        masu_count(); 
        change_turn();
        field_check();
      }
    });
  } else if(selected_cells.length < 2) {
    alert('2マス以上選択してください');
  } else {
    alert('白マスを1つは選択してください');
  }
})

// リセットボタン
reset_btn.addEventListener('click', function() {
  reset();
})