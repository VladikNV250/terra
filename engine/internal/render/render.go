package render

import (
	"runtime"
	"sync"
)

// ParallelRows executes the given function for each row from 0 to height-1 in parallel
// using a worker pool based on the number of available CPUs.
func ParallelRows(height int, fn func(y int)) {
	numWorkers := runtime.NumCPU()
	var wg sync.WaitGroup
	jobs := make(chan int, height)

	for w := 0; w < numWorkers; w++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for y := range jobs {
				fn(y)
			}
		}()
	}

	for y := 0; y < height; y++ {
		jobs <- y
	}
	close(jobs)

	wg.Wait()
}
