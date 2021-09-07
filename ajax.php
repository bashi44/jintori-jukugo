<?php
// ゲームajax処理
function dictionary() {
  $words = esc_attr(str_replace(array('', '　'), '', $_POST['value']));
  global $wpdb;
  $sql = $wpdb->prepare("SELECT * FROM $wpdb->dictionary WHERE kotoba = '".$words."' LIMIT 1");
  $results = $wpdb->get_results($sql);
  if(isset($results)) {
    foreach($results as $result) {
      $kotoba = $result->kotoba;
      $yomi = $result->yomi;
      $link = $result->link;
      $return_obj = array(
        "kotoba" => $kotoba,
        "yomi" => $yomi,
        "link" => $link
      );
    }
    echo json_encode($return_obj, JSON_UNESCAPED_UNICODE);
  }
  die();
}
add_action('wp_ajax_dictionary', 'dictionary');
add_action('wp_ajax_nopriv_dictionary', 'dictionary');