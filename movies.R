library(ggplot2)
str(movies)
?movies

head(movies)
movies$sum= rowSums(movies[18:24])
nrow(movies)
movies2 = (subset(movies, movies$sum<2 ))

nrow(movies2)
head(movies2)
data = movies2
sum(is.na(data[1]))
ncol(data)
for( i in seq(1:ncol(data)))
{
  print(i)
  print(sum(is.na(data[i])))
}
# Only budget column has NAs
data2 = data[,-c(4)]
head(data2)
write.csv(data2,"MOVIES30APR.csv")
?movies

data3=na.omit(data)
data3 = (subset(data3, data3$sum>0 ))
nrow(data3)
head(data3)
write.csv(data3,"Latest30APR.csv")
head(data3)
nrow(data3)
tabl= read.csv(file.choose())
head(tabl)
require(reshape2)
Frequency = as.data.frame(table(tabl$Genre))
Frequency
library(plyr)
Frequency=count(tabl,'Genre')
write.csv(Frequency,"Frequency.csv",row.names=FALSE)
library(reshape)
head(cast(tabl,Year+Genre~Length,sum))
head(tabl)
tab1 = tabl[,c("Genre","Year","Length")]
head(tab1)
datam= melt(tab1,id=c(1,2), measure=c(3))
head(datam)
cas1=cast(datam,Genre+Year~variable, mean,add.missing=TRUE,fill=0)
head(cas1)
write.csv(cas1,"TSJSON.csv",row.names=FALSE)
head(tabl)

dat4= tabl[,c(1,7,24)]
head(dat4)

dat4$category <- cut(dat4$Budget,
                     breaks=c(-Inf, 35000, 3000000, 13190000 , 15000000 , Inf),
                     labels=c("Low-Q1","Q1-Median","Median-Mean","Mean-Q3","Q3 to Max"))
dat5 = dat4[,c(1,4,3)]
head(dat5)

atam2= melt(dat5,id=c(1,2), measure=c(3))
head(atam2)
cas2=cast(atam2,Genre+category~variable, mean)
head(cas2)

cas4=cast(atam2,Genre+category~variable, mean,add.missing=TRUE,fill=0)
head(cas4)
cas4

write.csv(cas4,"BarJSON.csv",row.names=FALSE)

timeseries=dcast(cas1,Year~Genre)
timeseries
timeseries[is.na(timeseries)] <- 0
write.csv(timeseries,"TS.csv")
#install.packages("rjson")
library(rjson)
 x= toJSON(Frequency)

library(RJSONIO)
modified <- list(
  traits = colnames(Frequency),
  values = split(Frequency, seq_len(nrow(Frequency)))
)
cat(toJSON(modified),pretty=TRUE)
