/*
man page: http://man7.org/linux/man-pages/man1/du.1.html
du: Summarize disk usage of the set of FILEs, recursively for directories.
du [OPTION]... [FILE]...

options I want to try to implement:
        -b, --bytes
            equivalent to '--apparent-size --block-size=1'
        -B, --block-size=SIZE
            scale sizes by SIZE before printing them; e.g., '-BM' prints
            sizes in units of 1,048,576 bytes; see SIZE format below
        -c, --total
            produce a grand total
        -h, --human-readable
            print sizes in human readable format (e.g., 1K 234M 2G)
        --si   like -h, but use powers of 1000 not 1024
        -t, --threshold=SIZE
            exclude entries smaller than SIZE if positive, or entries
            greater than SIZE if negative
        --time show time of the last modification of any file in the
            directory, or any of its subdirectories
        --exclude=PATTERN
            exclude files that match PATTERN

*/