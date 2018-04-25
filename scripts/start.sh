#!/usr/bin/env bash

trap 'exit 0' EXIT

tsc -p src -w

