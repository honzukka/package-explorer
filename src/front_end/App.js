import React from 'react';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

import { InputSection, FileInputForm, LoadingButton } from './inputSection'
import { PackageList, PackageInformation } from './packageSection';
import { getMockData, getFileData } from '../back_end/data';

/**
 * This component contains the complete front-end of this program.
 */
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      packageNames: [],
      currentPackageInfo: null
    };

    this.packages = new Map();

    this.setMockData = this.setMockData.bind(this);
    this.setFileData = this.setFileData.bind(this);
    this.showPackageInfo = this.showPackageInfo.bind(this);
  }

  async setMockData() {
    let data = await getMockData();
    this.setData(data);
  }

  async setFileData(file) {
    let data = await getFileData(file);
    this.setData(data);
  }

  /**
   * Each dependency and reverse dependency in the data
   * is assigned a function which shows its information.
   * Then the package data is saved in this object.
   */
  setData(data) {
    for (let [packageName, packageData] of data) {
      [packageData.dependencies, packageData.reverseDependencies].map(
        (deps) => deps.map((depGroup) => depGroup.map((dep) => 
          dep.showPackageInfo = () => this.showPackageInfo(dep.name)
        ))
      );
      data.set(packageName, packageData);
    }

    this.packages = data;
    const packageNames = Array.from(data).map(([packageName, ]) => packageName);
    this.setState({ packageNames: packageNames, currentPackageInfo: null });
  }

  showPackageInfo(packageName) {
    const packageNames = this.state.packageNames;
    let currentPackageInfo = this.packages.get(packageName);
    currentPackageInfo.name = packageName;
    this.setState({ packageNames: packageNames, currentPackageInfo: currentPackageInfo });
  }

  render() {
    return (
      <Container fluid className="p-3">
        <PageHeading>Package Explorer</PageHeading>

        <InputSection subsections={[
            {
              header: {__html: "If you want to upload your own <code>/var/lib/dpkg/status</code>:"},
              body: <FileInputForm processFileAsync={this.setFileData} />
            },
            {
              header: {__html: "If you don't have <code>/var/lib/dpkg/status</code> handy:"},
              body: <LoadingButton onClickAsync={this.setMockData}>Submit mock file</LoadingButton>
            }
          ]}
        />

        <PackageList header={{__html: "Here is what the <code>/var/lib/dpkg/status</code> has revealed:"}}>
          {
            this.state.packageNames.map((packageName) => 
              <Button key={packageName}
                className="m-2"
                variant="outline-secondary"
                onClick={() => this.showPackageInfo(packageName)}
              >
                {packageName}
              </Button>
            )
          }
        </PackageList>

        <PackageInformation info={this.state.currentPackageInfo}/>
      </Container>
    );
  }
}

function PageHeading(props) {
  return <h1 className="display-3 mb-5">{props.children}</h1>;
}

export default App;