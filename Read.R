dg =(as.data.frame(Seatbelts))
library(lubridate)
dg$time= seq(ymd('1969-01-01'),ymd('1984-12-31'), by = '1 month')
head(dg)
ncol(dg)
dg = dg[,c(9,1:8)]
write.csv(dg,"DatavizTs.csv",row.names=FALSE)

?Seatbelts
#################

867+269+107

getwd()
dg =(as.data.frame(Seatbelts))
library(lubridate)

a=(start(Seatbelts))
a1=paste(c(a,1), collapse='-')

b=end(Seatbelts)
b1=paste(c(b,1), collapse='-')

dg$time= seq(ymd(a1),ymd(b1), by = '1 month')

dg$time= seq(ymd('1969-01-01'),ymd('1984-12-31'), by = '1 month')
head(dg)
ncol(dg)
dg = dg[,c(9,1:8)]
write.csv(dg,"DatavizTs.csv",row.names=FALSE)
