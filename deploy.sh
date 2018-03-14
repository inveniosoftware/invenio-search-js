# -*- coding: utf-8 -*-
#
# This file is part of Invenio.
# Copyright (C) 2015-2018 CERN.
#
# Invenio is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

set -e # exit with nonzero exit code if anything fails

# clear and re-create the docs directory
rm -rf docs || exit 0;

# compile docs
npm run-script docs

# go to the docs directory and create a *new* Git repo
git clone -b gh-pages --single-branch https://${GH_TOKEN}@${GH_REF} gh-pages
rm -rf gh-pages/*.html gh-pages/styles gh-pages/scripts
cp -r docs/* gh-pages
cd gh-pages

# set the user to invenio-developer
git config user.name "invenio-developers"
git config user.email "info@inveniosoftware.org"

# add and commit
git add .
git commit -m "docs: deployment to github pages"

# push the docs to gh-pages
git push --quiet origin gh-pages > /dev/null 2>&1
