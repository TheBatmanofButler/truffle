import dropbox

ACCESS_TOKEN = "MbwdtnaM6pAAAAAAAAAArH9Pauroq5kK6fJc20xVz-0BuRo-gJFrOWTd6mm9lav0"
dbx = dropbox.Dropbox(ACCESS_TOKEN)
print(dbx.users_get_current_account())

for entry in dbx.files_list_folder('').entries:
    print(entry.name)

dbx.files_upload("Potential headline: Game 5 a nail-biter as Warriors inch out Cavs", '/cavs vs warriors/game 5/story.txt')

