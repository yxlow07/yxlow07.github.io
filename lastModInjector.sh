#!/bin/bash

directory="./content/blog"

# Loop through all files in the directory (including subdirectories)
find "$directory" -type f | while read -r file; do
  echo "Processing file: $file"

  # Get the last modified date from git in ISO 8601 format and format it to Hugo style
  git_last_modified=$(git log -1 --format=%aI -- "$file") # %aI is for author date, ISO 8601 strict

  # Check if git_last_modified is empty (e.g., new file not yet committed)
  if [ -z "$git_last_modified" ]; then
    echo "No git history found for $file, skipping 'lastMod' update."
    echo "-----------------------------------"
    continue
  fi

  formatted_git_date=$(date -d "$git_last_modified" +"%Y-%m-%dT%H:%M:%S%:z")
  if [ $? -ne 0 ]; then
      echo "Warning: 'date -d ... +%:z' failed. This might happen on non-GNU systems."
      echo "Using git's raw ISO date: $git_last_modified"
      formatted_git_date="$git_last_modified" # Fallback to git's direct ISO output
  fi

  # Extract the front matter (between --- lines)
  front_matter=$(awk '/^---$/{f++; if(f==2) exit} f==1{print}' "$file")

  # Check if 'lastMod' is present in the front matter
  if echo "$front_matter" | grep -q -E "^lastMod:[[:space:]]"; then
    # If 'lastMod' exists, update it
    echo "Updating 'lastMod' attribute in the front matter for $file to $formatted_git_date."

    # Use sed to replace the lastMod value. Edits in-place without backup.
    sed -i "/^---$/,/^---$/s/^\(lastMod:[[:space:]]*\).*/\1\"$formatted_git_date\"/" "$file"
  else
    # If 'lastMod' doesn't exist, add it to the front matter
    echo "Adding 'lastMod' attribute to the front matter for $file as $formatted_git_date."

    # Use sed to insert the lastMod value right after the first --- line. Edits in-place without backup.
    sed -i "/^---$/a\\
lastMod: \"$formatted_git_date\"" "$file"
  fi
  echo "-----------------------------------"
done