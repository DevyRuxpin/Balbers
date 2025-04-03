#!/bin/bash
pip install -r requirements.txt
flask db upgrade
chmod +x build.sh