#!/usr/bin/env bash

shopt -s expand_aliases

alias tldr="node ./bin/tldr"

getSubdirectoriesSorted() {
    local directory="$HOME/.tldr/cache"
    local directories=$(find "$directory" -maxdepth 1 -mindepth 1 -type d -exec basename {} \;)
    echo "$directories" | tr ' ' '\n' | sort
}

arraysAreEqual() {
    local array1=("${!1}")
    local array2=("${!2}")

    if [ ${#array1[@]} -ne ${#array2[@]} ]; then
        return 1
    fi

    for ((i=0; i<${#array1[@]}; i++)); do
        if [ "${array1[$i]}" != "${array2[$i]}" ]; then
            return 1
        fi
    done

    return 0
}

testCases=(
    "LANG=; export LANGUAGE=; tldr --clear-cache; tldr --update" # No language specified
    "LANG='pt_BB'; export LANGUAGE=; tldr --clear-cache; tldr --update" # 1 Language Specified that doesn't exist
    "LANG='ca'; export LANGUAGE=; tldr --clear-cache; tldr --update" # 1 Language Specified that does exist
    "LANG='pt_BR'; export LANGUAGE='ne'; tldr --clear-cache; tldr --update" # 2 Langauges Specified that exist
)

expectedOutputs=(
    "pages"
    "pages"
    "pages pages.ca"
    "pages pages.ne pages.pt_BR"
)

echo "Testing Language Specific Downloads"

for i in "${!testCases[@]}"; do
    echo -n "Clearing Cache: "
    eval "${testCases[i]}"

    sorted_directories=($(getSubdirectoriesSorted))
    expected=(${expectedOutputs[i]})

    arraysAreEqual sorted_directories[@] expected[@]
    matched=$?

    # echo "Matched $matched"

    if [ "$matched" -eq 0 ]; then
        echo "Test passed for Language: $LANG"
    else
        echo "Test failed for Language: $LANG"
        exit 1
    fi
done