# Tools for getting Amtrak data

Amtrak currently doesn't have an easily-accessible API. This tool will use the
same APIs as
[Amtrak's Track Your Train Map](https://www.amtrak.com/track-your-train.html) to
extract information about trains that are currently active as well as those that
are only planned. The result is a set of JSON files representing the current
state of the map.

The tool can also build a static website from the data. A version of that site
is live at [mgwalker.github.io/amtrak-api/](https://mgwalker.github.io/amtrak-api/).

## Usage

To get the latest data and build the site, run:

```
npm run site
```

If you only want to fetch the latest data, run:

```
npm run update
```

## The data

### Stations

Path: `_site/stations.json`

An array of station objects, listing all of the stations identified on the
Amtrak map. The station objects look like this:

```
{
  code: . . string - three-letter station identifier
  name: . . string - the name of the station
  address1: string - street address of the station
  address2: string
  city:  .  string
  state:  . string
  zip:  . . string
  lat:  . . float  - geographic coordinates of the station
  lon:  . . float
  _raw: . . object - the raw data from Amtrak
}
```

### Routes

Path: `_site/routes.json`

An array of route objects, each one representing a whole Amtrak route. The
route object includes an array of trains, each representing one of the trains
that's currently running on that route. Then, each train has a list of stations
representing each station along the route. Here's what those look like:

#### Route:

```
{
  route:  string - name of the route
  trains: [ ]    - list of trains currently running on this route (see below)
}

```

#### Train:

```
{
  id:       int     - the train's internal Amtrak ID (not useful)
  heading:  char(2) - train's current cardinal or ordinal direction
  number:   int     - the train number
  route:    string  - the name of the route
  stations: [ ]     - list of stations this train stops at, sorted from
                      starting station to ending station (see below)
  _raw:     object  - the raw data from Amtrak
}
```

#### Station:

```
{
  code: . . string - the station's 3-letter code
  bus:  . . bool   - whether this station also has bus service, I think
  status: . string - the train's status relative to this station
  timezone: string - IANA timezone where the train currently is

  arrivalActual:  . . Arrival and departure times for this train at this
  arrivalEstimated: . station. All arrivals are null if this is the first
  arrivalScheduled: . station. Likewise departure for the last station.
  departureActual:  . Estimated times sometimes go away after a train
  departureEstimated: actually arrives or departs. Values are ISO 8601
  departureScheduled: date/time strings in UTC.

  station:  station object, as described in the Stations part of the README.
            This has the station name, address, etc.
}
```
