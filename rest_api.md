#sgdq15-layouts REST API

## Endpoints
### GET /sgdq15-layouts/stopwatches
Returns a JSON array containing all 4 stopwatches.

### PUT /sgdq15-layouts/stopwatch/:index/start
Starts (or resumes, if paused/finished) one of the four stopwatches. Index is zero-based.
If index is 'all', starts all stopwatches. Responds with the current status of the affected stopwatch(es).

### PUT /sgdq15-layouts/stopwatch/:index/pause
Pauses one of the four stopwatches. Index is zero-based.
If index is 'all', pauses all stopwatches. Paused stopwatches have a gray background in the layouts.
Responds with the current status of the affected stopwatch(es).

### PUT /sgdq15-layouts/stopwatch/:index/finish
Finishes one of the four stopwatches. Index is zero-based.
If index is 'all', finishes all stopwatches. Finished stopwatches have a green background in the layouts.
Responds with the current status of the affected stopwatch(es).

### PUT /sgdq15-layouts/stopwatch/:index/reset
Resets one of the four stopwatches to 00:00:00 and stops it. Index is zero-based.
If index is 'all', resets all stopwatches. Responds with the current status of the affected stopwatch(es).
