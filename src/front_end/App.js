import React from 'react';
import Container from 'react-bootstrap/Container';

import './App.css';
import { InputSection, FileInputForm, LoadingButton } from './inputSection'
import { PackageList, Item } from './packageSection';
import { getMockData, getFileData } from '../back_end/data';

/**
 * This component contains the complete front-end of this program.
 */
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      packages: new Map()
    };

    this.packageInfoToggles = new Map();

    this.setMockData = this.setMockData.bind(this);
    this.setFileData = this.setFileData.bind(this);
    this.registerInfoToggle = this.registerInfoToggle.bind(this);
    this.toggleInfo = this.toggleInfo.bind(this);
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
   * Adds a callback for switching from a package's info panel to another one.
   * The callback is saved at the dependency level where it is clear
   * where from and where to we are switching.
   */
  setData(data) {
    for (let [packageName, packageData] of data) {
      let depsList = [packageData.dependencies, packageData.reverseDependencies];
      [packageData.dependencies, packageData.reverseDependencies] = depsList.map(
        (deps) => deps.map((depGroup) => depGroup.map((dep) => ({
          name: dep.name,
          installed: dep.installed,
          toggleInfo: () => this.toggleInfo.bind(this)(packageName, dep.name)
        })))
      );
      data.set(packageName, packageData);
    }
    this.setState({ packages: data });
  }

  registerInfoToggle(packageName, show, close) {
    this.packageInfoToggles.set(packageName, { show: show, close: close });
  }

  /**
   * This function closes the previously registered component
   * of one package's info panel and opens another one.
   */
  toggleInfo(prevPackageName, nextPackageName) {
    this.packageInfoToggles.get(prevPackageName).close();
    this.packageInfoToggles.get(nextPackageName).show();
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
            Array.from(this.state.packages).map(([packageName, packageData]) => 
              <Item key={packageName}
                name={packageName}
                data={packageData}
                registerInfoToggle={this.registerInfoToggle}
              />
            )
          }
        </PackageList>
      </Container>
    );
  }
}

function PageHeading(props) {
  return <h1 className="display-3 mb-5">{props.children}</h1>;
}

export default App;