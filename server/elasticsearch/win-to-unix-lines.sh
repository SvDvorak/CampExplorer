# Converts windows line endings to unix ones
# Useful when developing in windows and wanting to test locally using Docker
# Git should convert to Unix line endings (if you have that set... which you should) when committing
tr -d '\15\32' < $1 > temp
mv temp $1
