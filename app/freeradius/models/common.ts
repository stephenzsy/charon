type ConfigValue = string | number | Config;

export class Config {
  type: string;
  config: {
    key: string;
    value: ConfigValue;
  }[] = [];

  constructor(type: string) {
    this.type = type;
  }

  protected addKeyedConfig(key: string, value: ConfigValue): this {
    if (value) {
      this.config.push({ key: key, value: value });
    }
    return this;
  }

  protected addConfig(value: ConfigValue): this {
    this.config.push({ key: null, value: value });
    return this;
  }
}

export class NamedConfig extends Config {
  name: string;

  constructor(type: string, name: string) {
    super(type);
    this.name = name;
  }
}

export class Generator {

  generate(config: Config, indent: number = 0): string {
    var prefix: string = '';
    for (var i = 0; i < indent; i += 2) {
      prefix += '  ';
    }
    var result: string[] = []
    if (config instanceof Config) {
      if (config instanceof NamedConfig) {
        result.push(prefix + config.type + ' ' + config.name + ' {');
      } else {
        result.push(prefix + config.type + ' {');
      }

      let subprefix: string = prefix + '  ';
      config.config.forEach(c => {
        var value: ConfigValue = c.value;
        if (value instanceof Config) {
          result.push(this.generate(value, indent + 2));
        } else if (c.key) {
          result.push(subprefix + c.key + ' = ' + value);
        } else {
          result.push(subprefix + value);
        }
      });

      result.push(prefix + '}');
    }
    return result.join("\n");
  }

}
