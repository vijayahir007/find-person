import os


# use this function to find all 'href' and 'src' urls in index.html
def find_all_substrings(html: str, substring: str) -> list:
    start = 0
    indexList = []
    while True:
        start = html.find(substring, start)
        if start == -1:
            return indexList
        indexList.append(start)
        start += len(substring)


# this function adds a '?' in front off all href and src urls in index.html so that they are requested as args to root url
def loadIndexFix():
    staticIndex = []
    offset = 0
    staticURLref = ["href=\"", "src=\""]
    with open(f"{os.getcwd()}/app/public/browser/index.html", "r") as main:
        indexHTML = main.read()
    # print(indexHTML)
    for staticRef in staticURLref:
        indexes = find_all_substrings(indexHTML, staticRef)  # find all static urls
        staticIndex += indexes
    staticIndex.pop(0)  # remove base reference
    # print(staticIndex)
    for index in staticIndex:
        if indexHTML[index + 5 + offset] == "?" or indexHTML[index + 6 + offset] == "?":
            pass
            # print(f"already done: {index}")
        else:
            # print(f"add ? here: {index}")
            if indexHTML.find(staticURLref[0], index) != -1:
                # fix href tags
                indexHTML = indexHTML[0:index + 6 + offset] + "?" + indexHTML[index + 6 + offset:]
                offset += 1
            else:
                # fix src tags
                indexHTML = indexHTML[0:index + 5 + offset] + "?" + indexHTML[index + 5 + offset:]
                print(indexHTML)
                offset += 1

    with open(f"{os.getcwd()}/app/public/browser/index.html", "w") as main:
        indexHTML = main.write(indexHTML)
