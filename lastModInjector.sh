#!/bin/bash

directory="./content/blog"

# Loop through all files in the directory (including subdirectories)
find "$directory" -type f | while read -r file; do
  echo "Processing file: $file"

  # Get the last modified timestamp from the filesystem
  # Use -c %Y for GNU/Linux stat (Unix timestamp)
  fs_last_modified_timestamp=$(stat -c %Y "$file" 2>/dev/null)

  # Check if stat command succeeded
  if [ -z "$fs_last_modified_timestamp" ]; then
    # Try the macOS/BSD version if the first one failed
    fs_last_modified_timestamp=$(stat -f %m "$file" 2>/dev/null)
  fi

  # If still empty, we couldn't get the date
  if [ -z "$fs_last_modified_timestamp" ]; then
    echo "Could not get filesystem last modified date for $file, skipping 'lastMod' update."
    echo "-----------------------------------"
    continue
  fi

  # Use @ to indicate a Unix timestamp input for date -d (GNU date)
  formatted_fs_date=$(date -d "@$fs_last_modified_timestamp" +"%Y-%m-%dT%H:%M:%S%:z" 2>/dev/null)

  # Check if GNU date command succeeded, if not, try macOS/BSD date
  if [ $? -ne 0 ]; then
      # macOS/BSD date requires -r for timestamp and different format string
      formatted_fs_date=$(date -r "$fs_last_modified_timestamp" +"%Y-%m-%dT%H:%M:%S%z" 2>/dev/null)
      # Add a colon to the timezone offset if it exists (for macOS/BSD output)
      if [[ "$formatted_fs_date" =~ ([+-][0-9]{2})([0-9]{2})$ ]]; then
          formatted_fs_date="${formatted_fs_date%??}:${formatted_fs_date: -2}"
      fi
  fi

  # Check if date formatting worked at all
  if [ -z "$formatted_fs_date" ] || [ $? -ne 0 ]; then
    echo "Warning: Could not format date for $file."
    echo "Trying a simpler ISO format without timezone."
    # Fallback to a simpler ISO 8601 format without timezone (2025-05-11T12:00:00should be more portable)
    formatted_fs_date=$(date -d "@$fs_last_modified_timestamp" +"%Y-%m-%dT%H:%M:%S" 2>/dev/null) \
        || formatted_fs_date=$(date -r "$fs_last_modified_timestamp" +"%Y-%m-%dT%H:%M:%S" 2>/dev/null)

    if [ -z "$formatted_fs_date" ]; then
        echo "Error: Could not format date even with fallback for $file. Skipping."
        echo "-----------------------------------"
        continue
    fi
  fi

  # Extract the front matter (between --- lines)
  front_matter=$(awk '/^---$/{f++; if(f==2) exit} f==1{print}' "$file")

  # Check if 'lastMod' is present in the front matter
  if echo "$front_matter" | grep -q -E "^lastMod:[[:space:]]"; then
    # If 'lastMod' exists, update it
    echo "Updating 'lastMod' attribute in the front matter for $file to $formatted_fs_date."

    # Note: Using different delimiters for sed to avoid issues with '/' in dates
    sed -i.bak "/^---$/,/^---$/s|^\(lastMod:[[:space:]]*\).*|\1\"$formatted_fs_date\"|" "$file" && rm "${file}.bak"
  else
    # If 'lastMod' doesn't exist, add it to the front matter
    echo "Adding 'lastMod' attribute to the front matter for $file as $formatted_fs_date."

    # Use sed to insert the lastMod value right after the first --- line. Edits in-place without backup.
    sed -i.bak "/^---$/a\\
lastMod: \"$formatted_fs_date\"" "$file" && rm "${file}.bak"
  fi
  echo "-----------------------------------"
done