<?php
$row = json_decode('{"id": "29","name":"John", "age":"36"}');

foreach($row as $xx => $val)
    {
        echo $xx . ': ' . $val;
        echo '<br>';
    }
 ?>