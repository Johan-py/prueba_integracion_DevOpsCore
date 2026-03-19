#!/bin/bash

./dev_simulator.sh feature/descargar_informacion_de_usuarios 20 &
./dev_simulator.sh feature/cambio_nombre 20 &
./dev_simulator.sh feature/eliminar_cuenta 20 &

wait
