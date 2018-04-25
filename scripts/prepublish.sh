#!/usr/bin/env bash

if [ ! -e package.json ] || grep -q '/data' package.json || grep -q 'file:../' package.json ; then
	echo -e "\e[38;5;9mMust not depend on /data/xxx in package.json\e[0m" >&2
	echo "" >&2
	exit 1
fi
