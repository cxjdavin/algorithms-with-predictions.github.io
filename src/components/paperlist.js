import {
  Box,
  Divider,
  Select,
  Slider,
  Stack,
  Typography,
  Chip,
  ListItem,
  ListItemText,
  List,
  MenuItem,
  Button,
} from "@mui/material";
import * as React from "react";
import styled from "@emotion/styled";
import PropTypes from "prop-types";

const openInNewTab = (url) => {
  const newWindow = window.open(url, "_blank", "noopener,noreferrer");
  if (newWindow) newWindow.opener = null;
};

const AuthorText = styled("div")`
  color: #878787;
`;

const TitleText = styled("div")`
  font-weight: bold;
`;

function minYearOfPaper(paper) {
  const years = paper.publications.map((pub) => pub.year);
  return Math.min(...years);
}

function valuetext(value) {
  return value;
}

function stringCmp(a, b) {
  var nameA = a.toUpperCase();
  var nameB = b.toUpperCase();
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0;
}

const SORT_YEAR_TOP_DOWN = "Newest first";
const SORT_YEAR_BOTTOM_UP = "Oldest first";
const sortOptions = [SORT_YEAR_BOTTOM_UP, SORT_YEAR_TOP_DOWN];

const PaperList = ({ data }) => {
  const allYears = data.flatMap((paper) =>
    paper.publications.flatMap((pub) => pub.year)
  );
  const allLabels = data.flatMap((paper) => (paper.labels ? paper.labels : []));
  let distinctLabels = [...new Set(allLabels)];
  distinctLabels.sort(stringCmp);
  const minYear = Math.min(...allYears);
  const maxYear = Math.max(...allYears);

  const [years, setYears] = React.useState([minYear, maxYear]);
  const [sort, setSort] = React.useState(SORT_YEAR_TOP_DOWN);
  const [selLabels, setSelLabels] = React.useState([]);

  const labelChip = (label, deleteable) => (
    <Chip
      size="small"
      key={label}
      label={label}
      variant={deleteable && selLabels.includes(label) ? "outlined" : "filled"}
      color={
        label === "online" || label === "running time" ? "success" : "primary"
      }
      onClick={() => setSelLabels([label, ...selLabels])}
      onDelete={
        deleteable && selLabels.includes(label)
          ? () => {
              setSelLabels(selLabels.filter((l) => l !== label));
            }
          : undefined
      }
    />
  );

  const paperChips = (paper) => {
    const labels = "labels" in paper ? paper.labels : [];
    labels.sort(stringCmp);
    let pubs = paper.publications;
    pubs.sort((a, b) => stringCmp(a.name, b.name));
    let chips = paper.publications.map((pub) => {
      let text = pub.name + " '" + pub.year.toString().slice(-2);

      return (
        <Chip
          size="small"
          label={text}
          key={text}
          variant={"arXiv" === pub.name ? "outlined" : "filled"}
          color="secondary"
          onClick={() => ("url" in pub ? openInNewTab(pub.url) : {})}
        />
      );
    });

    chips = chips.concat(labels.map((label) => labelChip(label, false)));

    return chips;
  };

  const buildListItems = (data) => {
    return data.map((paper, i) => (
      <ListItem key={i}>
        <ListItemText
          primary={
            <Stack direction="row" spacing={3}>
              <TitleText>{paper.title}</TitleText>
              <AuthorText>{paper.authors}</AuthorText>
              <Stack direction="row" spacing={1}>
                {paperChips(paper)}
              </Stack>
            </Stack>
          }
        />
      </ListItem>
    ));
  };

  const handleSort = (event) => {
    setSort(event.target.value);
  };

  const filteredData = data
    .filter((p) =>
      p.publications.some((pub) => years[0] <= pub.year && pub.year <= years[1])
    )
    .filter(
      (p) =>
        selLabels.length === 0 || p.labels.some((l) => selLabels.includes(l))
    );
  const sortedData = filteredData.sort(function (p1, p2) {
    if (sort === SORT_YEAR_TOP_DOWN) {
      return minYearOfPaper(p2) - minYearOfPaper(p1);
    } else {
      return minYearOfPaper(p1) - minYearOfPaper(p2);
    }
  });

  const items = buildListItems(sortedData);
  const marks = Array.from(
    new Array(maxYear - minYear + 1),
    (x, i) => i + minYear
  ).map((year) => ({
    value: year,
    label: year.toString(),
  }));

  return (
    <div>
      <Stack
        direction="row"
        justifyContent={"space-between"}
        alignItems="center"
      >
        <Stack
          direction="row"
          p={1}
          spacing={2}
          alignItems="center"
          justifyContent={"flex-start"}
        >
          <Box sx={{ width: 300, pr: 2 }}>
            <Slider
              getAriaLabelText={valuetext}
              value={years}
              min={minYear}
              max={maxYear}
              onChange={(_, newValue) => setYears(newValue)}
              valueLabelDisplay="auto"
              marks={marks}
              disableSwap
            />
          </Box>
          <Select value={sort} autoWidth={true} onChange={handleSort}>
            {sortOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
          <Typography>{items.length} papers</Typography>
        </Stack>
        {selLabels.length > 0 && (
          <Button
            variant="contained"
            color="error"
            onClick={() => setSelLabels([])}
          >
            Reset
          </Button>
        )}
      </Stack>
      <Divider />
      <Stack
        spacing={1}
        direction="row" //{{ md: "column-reverse", lg: "row" }}
        alignItems="stretch"
        justifyContent={"space-between"}
      >
        <List dense="true">{items}</List>
        <Box sx={{ display: "flex" }}>
          <Divider orientation={"vertical"} flexItem />
          <Stack
            flexWrap={"wrap"}
            pl={1}
            pt={1}
            spacing={1}
            direction="column" //"row", lg: "column" }}
          >
            {distinctLabels.map((l) => labelChip(l, true))}
          </Stack>
        </Box>
      </Stack>
    </div>
  );
};

PaperList.propTypes = {
  data: PropTypes.array,
};

export default PaperList;
