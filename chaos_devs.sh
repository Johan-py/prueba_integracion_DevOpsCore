#!/bin/bash

./dev_simulator.sh Feacture/descargar_informacion_de_usuarios 20 &
./dev_simulator.sh Feacture/cambio_nombre 20 &
./dev_simulator.sh Feacture/eliminar_cuenta 20 &

wait
