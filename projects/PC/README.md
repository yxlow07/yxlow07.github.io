# Version Changelog in Purata Counter
<hr>

**Version 1.0**
- Basic functionality: Counter for the main 8 subjects
- Two separate objects for storing pemberat and marks
- Display of purata is not optimised

**Version 1.1**
- Added cocurriculum

**Version 2.0**
- Added function to give an estimate of how much the remaining subjects must get in order to reach target given by user
- Optimised objects by merging marks and pemberat together
- Round off purata to three decimal places
- Colored the purata, red = failed and green = passed

**Version 2.0.1**
- Added color for target, green = doable / yellow = very hard but sure / red = impossible / blue = target too low already passed
- Optimised the string too long / repetitive => Print one time will do _(Credit: How Yi)_
- Optimised print colored to follow DRY concept
- Added blank lines to help readability

**Version 2.0.2**
- Changed from int to float in the case of marks having decimal places such as cocurriculum _(Credit: Zedex)_
- Update suggestions: 
  - Enable students who had received all their marks to set target _(Credit: Zhi Xue)_

**Version 2.0.3**
- Fixed bug where 0 marks does not count

**Version 3.0**
- Migrated from python to HTML CSS JS
- Basic functionality established
- Features yet to be added: 
    - Target calculator

**Bug Patch 3.0.1**
- Fixed bug where deleting value in input does not change purata / display incorrect value
- Fixed bug where after displaying value exceed error purata remains incorrect with previous input

**Final Version Version 3.1**
- Link preview (meta tags previously missing)
- Optimised javascript (Functions are extracted)
- Added keypad feature (Only available for pc users or tablet since phone keyboard will not break some keys)
- Optimised error toasts for dynamic messages (Caution this also stacks infinitely but so far testing shows no problems)

**Version 3.1.1**
- Fixed "seni" pemberat into 2 instead of 3